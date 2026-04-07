# esm-patient-orders-app

Central orders management system for OpenMRS 3 Patient Chart - handles medications, lab tests, procedures, and general orders.

## **Core functionality**

### **Order management**

- **Order Basket**: Centralized workspace for creating and managing pending orders
- **Order Types**: Medications, lab tests, procedures, general orders
- **Order Lifecycle**: Create → Modify → Renew → Discontinue → Track results
- **Order Tables**: View, search, filter, and manage existing orders

### **Lab results**

- **Results Entry**: Enter and validate lab test results
- **Dynamic Forms**: Auto-generated forms based on lab concept configuration
- **Validation**: Range limits, decimal restrictions, required fields
- **Print Support**: Generate printable lab result reports

### **Order workflows**

- **Medication Orders**: Drug prescriptions with dosing, frequency, duration
- **Lab Orders**: Laboratory tests with specimen requirements and scheduling
- **Test Orders**: Diagnostic procedures and imaging studies
- **General Orders**: Custom orders for other clinical services

## **Configuration points**

### **Order encounter type**

```typescript
// config-schema.ts
orderEncounterType: {
  _type: Type.UUID,
  _description: 'The encounter type for orders',
  _default: '39da3525-afe4-45ff-8977-c53b7b359158', // "Order" encounter type
}
```

**What to change**: Set to your organization's preferred encounter type for orders

### **Order types & concept sets**

```typescript
orderTypes: {
  _type: Type.Array,
  _elements: {
    orderTypeUuid: '131168f4-15f5-102d-96e4-000c29c2a5d7', // Drug Order UUID
    orderableConceptSets: ['drug-concepts-uuid'], // Concept set UUIDs
    label: 'Medications', // Display label
    icon: 'omrs-icon-medication' // OpenMRS icon name
  }
}
```

**What to change**:

- Add your custom order types
- Configure which concepts are orderable
- Set custom labels and icons for your workflows

### **Print button visibility**

```typescript
showPrintButton: {
  _type: Type.Boolean,
  _description: 'Show print button in order tables',
  _default: false
}
```

**What to change**: Enable/disable print functionality based on your printing needs

### **Reference number field**

```typescript
showReferenceNumberField: {
  _type: Type.Boolean,
  _description: 'Show reference number field in order forms',
  _default: true
}
```

**What to change**: Control whether accession/reference numbers are required

## **Customization points**

### **Extension slots**

- **`top-of-lab-order-form-slot`**: Add content above lab order forms
- **`order-item-additional-info-slot`**: Extend order basket item display
- **`order-basket-slot`**: Customize order basket layout

### **Lab concept configuration**

Lab forms are auto-generated based on concept metadata from the concept_numeric table.

- `hiAbsolute`/`lowAbsolute`: Read from concept_numeric table
- `allowDecimal`: Read from concept_numeric.allow_decimal
- `answers`: Read from concept.answers (coded concepts)
- `units`: Read from concept_numeric.units

### **Order validation rules**

- **Required fields**: Configured in concept definitions
- **Range limits**: Set in concept_numeric table
- **Business rules**: Primarily client-side validation with Zod schemas
- **Backend validation**: Basic structural validation only

## **Implementation checklist**

### **Required setup**

- [ ] Configure `orderEncounterType` UUID
- [ ] Set up order types and concept sets
- [ ] Configure lab concepts with ranges and units
- [ ] Set user permissions for order management

### **Optional customizations**

- [ ] Enable/disable print functionality
- [ ] Configure reference number requirements
- [ ] Add custom extension slot content
- [ ] Customize order type labels and icons
- [ ] Extend client-side validation rules via Zod schema modifications

### **Testing**

- [ ] Test order creation for each order type
- [ ] Verify lab result entry and validation
- [ ] Test order modification and discontinuation
- [ ] Validate print functionality (if enabled)

## **Key files for customizations**

- **`config-schema.ts`**: Main configuration options
- **`src/order-basket/`**: Order basket functionality
- **`src/lab-results/`**: Lab results management
- **`src/components/`**: Reusable UI components
