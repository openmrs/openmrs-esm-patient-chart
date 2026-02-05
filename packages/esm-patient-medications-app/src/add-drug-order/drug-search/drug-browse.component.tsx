import { Button, ComboBox, Tile, Loading, Breadcrumb, BreadcrumbItem, ClickableTile } from '@carbon/react';
import { useConfig, useLayoutType, type Visit, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { Folder } from '@carbon/react/icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type ConfigObject } from '../../config-schema';
import DrugBrowseResults from './drug-browse-results.component';
import {
  type ConceptSet,
  type ConceptTreeNode,
  useConceptSets,
  useConceptTree,
  useDrugsByConcepts,
} from './drug-search.resource';
import styles from './order-basket-search.scss';

interface DrugBrowseProps {
  openOrderForm: (searchResult: DrugOrderBasketItem) => void;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  patient: fhir.Patient;
  visit: Visit;
}

export default function DrugBrowse({ openOrderForm, closeWorkspace, patient, visit }: DrugBrowseProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const { drugCategoryConceptSets } = useConfig<ConfigObject>();
  const { conceptSets, isLoading: isLoadingConceptSets } = useConceptSets(drugCategoryConceptSets);
  const [rootConceptSet, setRootConceptSet] = useState<ConceptSet | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<ConceptTreeNode[]>([]);
  const { tree, isLoading: isLoadingTree, isError: isTreeError } = useConceptTree(rootConceptSet?.uuid);

  useEffect(() => {
    if (tree) {
      setBreadcrumbs([tree]);
    } else {
      setBreadcrumbs([]);
    }
  }, [tree]);

  const currentNode = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null;

  const { subCategories, drugConceptUuids } = useMemo(() => {
    const subCategories: ConceptTreeNode[] = [];
    const drugConceptUuids: string[] = [];

    if (currentNode && currentNode.setMembers) {
      currentNode.setMembers.forEach((member) => {
        if (member.isSet) {
          subCategories.push(member);
        } else {
          drugConceptUuids.push(member.uuid);
        }
      });
    } else if (currentNode && !currentNode.isSet) {
      drugConceptUuids.push(currentNode.uuid);
    }

    return { subCategories, drugConceptUuids };
  }, [currentNode]);

  const { drugs, isLoading: isLoadingDrugs, hasFailures } = useDrugsByConcepts(drugConceptUuids);

  const onRootChange = useCallback(({ selectedItem }: { selectedItem: ConceptSet }) => {
    setRootConceptSet(selectedItem ?? null);
  }, []);

  const handleDrillDown = (node: ConceptTreeNode) => {
    setBreadcrumbs((prev) => [...prev, node]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  return (
    <div className={styles.searchPopupContainer}>
      <div className={styles.comboBoxWrapper}>
        <ComboBox
          id="service-type-concept-set-combobox"
          size="lg"
          items={conceptSets}
          selectedItem={rootConceptSet}
          itemToString={(item) => item?.display ?? ''}
          placeholder={t('selectCategory', 'Search and select a category (e.g. Mental Health)')}
          aria-label={t('selectCategory', 'Search and select a category (e.g. Mental Health)')}
          titleText={t('browseDrugsByCategory', 'Browse drugs by category')}
          onChange={onRootChange}
          disabled={isLoadingConceptSets}
        />
      </div>

      {isLoadingTree && (
        <Loading description={t('loadingCategoryTree', 'Loading category tree...')} withOverlay={false} small />
      )}

      {isTreeError && (
        <Tile className={styles.errorTile}>{t('errorLoadingTree', 'Error loading category structure')}</Tile>
      )}

      {breadcrumbs.length > 1 && (
        <div className={styles.breadcrumbsContainer}>
          <Breadcrumb>
            {breadcrumbs.map((node, index) => (
              <BreadcrumbItem
                key={node.uuid}
                isCurrentPage={index === breadcrumbs.length - 1}
                onClick={() => handleBreadcrumbClick(index)}
                className={styles.breadcrumbItem}
              >
                {node.display}
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
        </div>
      )}

      {subCategories.length > 0 && (
        <div className={styles.categoriesContainer}>
          <h5 className={styles.sectionTitle}>{t('subCategories', 'Categories')}</h5>
          <div className={styles.tileGrid}>
            {subCategories.map((category) => (
              <ClickableTile
                key={category.uuid}
                onClick={() => handleDrillDown(category)}
                className={styles.categoryTile}
              >
                <Folder size={20} className={styles.folderIcon} />
                <span className={styles.categoryName}>{category.display}</span>
              </ClickableTile>
            ))}
          </div>
        </div>
      )}

      {currentNode && (
        <div className={styles.drugResultsWrapper}>
          {drugConceptUuids.length > 0 && <h5 className={styles.sectionTitle}>{t('drugs', 'Drugs')}</h5>}
          <DrugBrowseResults
            drugs={drugs}
            isLoading={isLoadingDrugs}
            isError={hasFailures}
            patient={patient}
            visit={visit}
            closeWorkspace={closeWorkspace}
            openOrderForm={openOrderForm}
            hasSelection={Boolean(rootConceptSet)}
          />
        </div>
      )}

      {isTablet && (
        <div className={styles.separatorContainer}>
          <p className={styles.separator}>{t('or', 'or')}</p>
          <Button iconDescription="Return to order basket" kind="ghost" onClick={() => closeWorkspace()}>
            {t('returnToOrderBasket', 'Return to order basket')}
          </Button>
        </div>
      )}
    </div>
  );
}
