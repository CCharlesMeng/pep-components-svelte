export interface LinkItem {
  href: string;
  text: string;
  external: boolean;
}

export interface ParagraphBlock {
  type: 'paragraph';
  text: string;
  links?: LinkItem[];
  images?: string[];
  blocks?: Block[];
}

export interface ApiEndpointBlock {
  type: 'api-endpoint';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
  path: string;
}

export interface ApiCodePanelRequest {
  language: string;
  code: string;
}

export interface ApiCodePanelResponse {
  status: string;
  body: string;
}

export interface ApiCodePanelBlock {
  type: 'api-code-panel';
  title: string;
  request: ApiCodePanelRequest;
  responses: ApiCodePanelResponse[];
}

export interface ApiParamBlock {
  type: 'api-param';
  name: string;
  param_type: string;
  location?: string;
  required: boolean;
  default: unknown;
  description: string;
  enum_values: string[] | null;
  example: string | null;
  constraints: string[];
  list_items: string[];
  content: Block[];
}

export interface TabsItem {
  title: string;
  content_type?: string;
  description?: string;
  content: Block[];
}

export interface TabsBlock {
  type: 'tabs';
  items: TabsItem[];
}

export type Block =
  | ParagraphBlock
  | ApiEndpointBlock
  | ApiCodePanelBlock
  | ApiParamBlock
  | TabsBlock;

export interface DocSection {
  title: string;
  content_type?: string;
  content: Block[];
}

export interface PepDocApiProps {
  id: string;
  title: string;
  category?: string;
  content: Block[];
  sections: DocSection[];
}
