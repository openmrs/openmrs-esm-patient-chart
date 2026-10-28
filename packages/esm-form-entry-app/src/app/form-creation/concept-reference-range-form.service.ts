import { Injectable } from '@angular/core';
import { AfeFormControl, ArrayNode, Form, GroupNode, NodeBase, ObsAdapterHelper } from '@openmrs/ngx-formentry';
import moment from 'moment';
import { forkJoin, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, filter, map, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import {
  ConceptReferenceRangeResourceService,
  ReferenceRangeContext,
} from '../openmrs-api/concept-reference-range-resource.service';
import { getNumericQuestionConcepts, resolveConceptUuid } from '../form-schema/concept-reference-ranges';
import { ConceptReferenceRange } from '../types';

interface NumericNode {
  control: AfeFormControl;
  concept: string;
  context: ReferenceRangeContext;
}

@Injectable({ providedIn: 'root' })
export class ConceptReferenceRangeFormService {
  private readonly loading = new WeakSet<Form>();
  private readonly loaded = new Subject<Form>();

  constructor(
    private readonly ranges: ConceptReferenceRangeResourceService,
    private readonly payloads: ObsAdapterHelper,
  ) {}

  isLoading(form: Form): boolean {
    return this.loading.has(form);
  }

  whenLoaded(form: Form): Observable<void> {
    return this.isLoading(form)
      ? this.loaded.pipe(
          filter((loadedForm) => loadedForm === form),
          take(1),
          map(() => undefined),
        )
      : of(undefined);
  }

  connect(form: Form, patientUuid: string): Subscription {
    const subscriptions = new Subscription();
    if (!getNumericQuestionConcepts(form.schema).length) {
      return subscriptions;
    }
    const changes = new Subject<void>();
    const registered = new WeakSet<NodeBase>();
    const requested = new WeakMap<AfeFormControl, string>();
    const encounterDate = form.searchNodeByQuestionId('', 'encounterDatetime')[0];
    const currentMeasurementDate = moment().format();
    const contextOf = (node: NodeBase, parent?: NodeBase) =>
      contextFor(
        node,
        parent,
        encounterDate,
        form.valueProcessingInfo.encounterUuid,
        currentMeasurementDate,
        this.payloads,
      );
    const refresh = () => {
      this.loading.add(form);
      changes.next();
    };

    const register = (node: NodeBase, parent?: NodeBase) => {
      if (!node || registered.has(node)) {
        return;
      }
      registered.add(node);
      const schema = node.question.extras;
      if (schema?.type === 'encounterDatetime' || schema?.questionOptions?.obsField === 'obsDatetime') {
        subscriptions.add(node.control.valueChanges.subscribe(refresh));
      }
      if (isNumeric(node)) {
        // Editing an answer decides whether it's sent with the encounter, which can change the date
        // it's saved with.
        subscriptions.add(
          node.control.valueChanges.subscribe(() => {
            const context = requested.get(node.control);
            if (context !== undefined && context !== JSON.stringify(contextOf(node, parent))) {
              refresh();
            }
          }),
        );
      }
      if (node instanceof ArrayNode) {
        node.addChildNodeCreatedListener((child: GroupNode) => {
          if (!subscriptions.closed) {
            register(child, node);
            refresh();
          }
        });
      }
      childrenOf(node).forEach((child) => register(child, node));
    };
    register(form.rootNode);
    this.loading.add(form);

    subscriptions.add(
      changes
        .pipe(
          startWith(undefined),
          debounceTime(0),
          switchMap(() => {
            const controls: Array<AfeFormControl> = [];
            const groups = new Map<string, Array<NumericNode>>();
            const collect = (node: NodeBase, parent?: NodeBase) => {
              if (isNumeric(node)) {
                controls.push(node.control);
                const concept = resolveConceptUuid(form.schema, node.question.extras?.questionOptions?.concept);
                if (concept) {
                  const context = contextOf(node, parent);
                  const key = JSON.stringify(context);
                  requested.set(node.control, key);
                  const nodes = groups.get(key) ?? [];
                  nodes.push({ control: node.control, concept, context });
                  groups.set(key, nodes);
                }
              }
              childrenOf(node).forEach((child) => collect(child, node));
            };
            collect(form.rootNode);

            const requests = Array.from(groups.values()).map((nodes) =>
              this.ranges
                .getConceptReferenceRanges(
                  patientUuid,
                  Array.from(new Set(nodes.map(({ concept }) => concept))),
                  nodes[0].context,
                )
                .pipe(map((ranges) => ({ nodes, ranges }))),
            );
            // Cancel stale requests immediately, before the debounced refresh starts.
            return (requests.length ? forkJoin(requests).pipe(takeUntil(changes)) : of([])).pipe(
              map((loadedGroups) => ({ controls, loadedGroups })),
            );
          }),
        )
        .subscribe(({ controls, loadedGroups }) => {
          // Current ranges stay in place until their replacements arrive, so warnings don't flicker.
          const rangeByControl = new Map<AfeFormControl, ConceptReferenceRange | undefined>();
          controls.forEach((control) => rangeByControl.set(control, undefined));
          for (const { nodes, ranges } of loadedGroups) {
            for (const { control, concept } of nodes) {
              rangeByControl.set(control, ranges.get(concept));
            }
          }
          for (const [control, range] of rangeByControl) {
            control.conceptReferenceRange = range;
            control.updateValueAndValidity({ emitEvent: false });
            control.updateAlert();
          }
          form.rootNode.control.updateValueAndValidity({ emitEvent: false });
          this.loading.delete(form);
          this.loaded.next(form);
        }),
    );
    subscriptions.add(() => {
      changes.complete();
      this.loading.delete(form);
    });
    return subscriptions;
  }
}

function childrenOf(node: NodeBase): Array<NodeBase> {
  return Array.isArray(node.children) ? node.children : Object.values(node.children ?? {});
}

function isNumeric(node: NodeBase): node is NodeBase & { control: AfeFormControl } {
  return node.control instanceof AfeFormControl && ['number', 'decimal'].includes(node.question.renderingType);
}

/**
 * Returns the context for the date the answer will be saved with, which depends on whether the
 * answer is sent with the encounter.
 */
function contextFor(
  node: NodeBase,
  parent: NodeBase | undefined,
  encounterDate: NodeBase | undefined,
  encounterUuid: string | undefined,
  currentMeasurementDate: string,
  payloads: ObsAdapterHelper,
): ReferenceRangeContext {
  const observation = node.initialValue as { uuid?: string; obsDatetime?: string } | undefined;
  const complexObs = parent?.question.extras?.type === 'complex-obs' ? parent : undefined;
  const savedEncounterDate = validDate(encounterDate?.initialValue);
  const sent: { voided?: boolean } | undefined = payloads.getObsNodePayload(complexObs ?? node)[0];

  let date: string | undefined;
  if (observation?.uuid && (!sent || sent.voided)) {
    // REST only applies an encounter date change to the observations sent with the encounter, so a
    // saved answer that isn't sent keeps its date.
    date = validDate(observation.obsDatetime);
  } else {
    // Core gives an observation sent without a date the encounter date, and moves one sent with the
    // saved encounter date to the new encounter date.
    const ownDate =
      validDate(
        complexObs
          ? childrenOf(complexObs).find((child) => child.question.extras?.questionOptions?.obsField === 'obsDatetime')
              ?.control.value
          : undefined,
      ) ?? validDate(observation?.obsDatetime);
    date =
      ownDate && !(savedEncounterDate && moment(ownDate).isSame(savedEncounterDate))
        ? ownDate
        : validDate(encounterDate?.control.value);
  }

  if (!date) {
    // A payload without an encounter date leaves an existing encounter's saved date in place, and
    // REST gives a new encounter the time of the save.
    if (encounterUuid) {
      return { encounter: encounterUuid };
    }
    date = currentMeasurementDate;
  }
  if (encounterUuid && savedEncounterDate && moment(savedEncounterDate).isSame(date)) {
    return { encounter: encounterUuid };
  }
  if (observation?.uuid && observation.obsDatetime && moment(observation.obsDatetime).isSame(date)) {
    return { obs: observation.uuid };
  }
  return { date };
}

function validDate(value: moment.MomentInput): string | undefined {
  return value && moment(value).isValid() ? moment(value).format() : undefined;
}
