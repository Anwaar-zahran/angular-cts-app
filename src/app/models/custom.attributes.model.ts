export interface CustomAttributeComponent {
  label: string;
  labelPosition: string;
  placeholder: string;
  description: string;
  tooltip: string;
  customClass: string;
  tabindex: string;
  hidden: boolean;
  hideLabel: boolean;
  autofocus: boolean;
  disabled: boolean;
  tableView: boolean;
  modalEdit: boolean;
  delimeter: string;
  maxTags: number;
  storeas: string;
  redrawOn: string;
  clearOnHide: boolean;
  customDefaultValue: string;
  calculateValue: string; 
  unique: boolean;
  validateOn: string;
  errorLabel: string;
  key: string;
  tags: any[];
  values: any[];
  properties: any;
  conditional: {
    show: any;
    when: any;
    eq: string;
    json: string;
  };
  customConditional: string;
  logic: any[];
  type: string;
  input: boolean;
  prefix: string;
  suffix: string;
  multiple: boolean;
  protected: boolean;
  persistent: boolean;
  refreshOn: string;
  dataGridLabel: boolean;
  dbIndex: boolean;
  calculateServer: boolean;
  widget: {
    type: string;
  };
  attributes: any;
  overlay: {
    style: string;
    left: string;
    top: string;
    width: string;
    height: string;
  };
  allowCalculateOverride: boolean;
  encrypted: boolean;
  showCharCount: boolean;
  showWordCount: boolean;
  allowMultipleMasks: boolean;
  id: string;
  defaultValue: string;
}
