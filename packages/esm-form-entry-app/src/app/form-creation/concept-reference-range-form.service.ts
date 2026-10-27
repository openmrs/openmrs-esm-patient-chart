import { Injectable } from '@angular/core';
import { AfeFormControl, ArrayNode, Form, GroupNode, NodeBase } from '@openmrs/ngx-formentry';
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
  context: ReferenceRangeContext | null;
}

@Injectable({ providedIn: 'root' })
export class ConceptReferenceRangeFormService {
  private readonly loading = new WeakSet<Form>();
  private readonly loaded = new Subject<Form>();

  constructor(private readonly ranges: ConceptReferenceRangeResourceService) {}

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
    const encounterDate = form.searchNodeByQuestionId('', 'encounterDatetime')[0];
    const currentMeasurementDate = new Date().toISOString();
    const refresh = () => {
      this.loading.add(form);
      changes.next();
    };

    const register = (node: NodeBase) => {
      if (!node || registered.has(node)) {
        return;
      }
      registered.add(node);
      const schema = node.question.extras;
      if (schema?.type === 'encounterDatetime' || schema?.questionOptions?.obsField === 'obsDatetime') {
        subscriptions.add(node.control.valueChanges.subscribe(refresh));
      }
      if (node instanceof ArrayNode) {
        node.addChildNodeCreatedListener((child: GroupNode) => {
          if (!subscriptions.closed) {
            register(child);
            refresh();
          }
        });
      }
      childrenOf(node).forEach(register);
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
              const options = node.question.extras?.questionOptions;
              if (
                node.control instanceof AfeFormControl &&
                ['number', 'decimal'].includes(node.question.renderingType)
              ) {
                controls.push(node.control);
                const concept = resolveConceptUuid(form.schema, options?.concept);
                if (concept) {
                  const context = contextFor(
                    node,
                    parent,
                    encounterDate,
                    form.valueProcessingInfo.encounterUuid,
                    currentMeasurementDate,
                  );
                  if (context) {
                    const key = JSON.stringify(context);
                    const nodes = groups.get(key) ?? [];
                    nodes.push({ control: node.control, concept, context });
                    groups.set(key, nodes);
                  }
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

function contextFor(
  node: NodeBase,
  parent: NodeBase | undefined,
  encounterDate: NodeBase | undefined,
  encounterUuid: string | undefined,
  currentMeasurementDate: string,
): ReferenceRangeContext | null {
  const observation = node.initialValue as { uuid?: string; obsDatetime?: string } | undefined;
  const observationDate =
    parent?.question.extras?.type === 'complex-obs'
      ? childrenOf(parent).find((child) => child.question.extras?.questionOptions?.obsField === 'obsDatetime')?.control
          .value
      : undefined;
  const savedEncounterDate = encounterDate?.initialValue;

  // An observation saved without its own date takes the encounter date, and the backend only moves
  // a saved observation to a new encounter date when it was recorded at the old one.
  let value: string | Date | undefined;
  if (observationDate && moment(observationDate).isValid()) {
    value = observationDate;
  } else if (
    observation?.obsDatetime &&
    !(savedEncounterDate && moment(observation.obsDatetime).isSame(savedEncounterDate))
  ) {
    value = observation.obsDatetime;
  } else if (encounterDate) {
    value = encounterDate.control.value;
  } else if (encounterUuid) {
    return { encounter: encounterUuid };
  } else {
    value = currentMeasurementDate;
  }

  if (!value || !moment(value).isValid()) {
    return null;
  }
  const date = moment(value).format();
  if (encounterUuid && savedEncounterDate && moment(savedEncounterDate).isSame(date)) {
    return { encounter: encounterUuid };
  }
  if (observation?.uuid && observation.obsDatetime && moment(observation.obsDatetime).isSame(date)) {
    return { obs: observation.uuid };
  }
  return { date };
}
