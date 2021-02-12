export interface IDocumentApiModel {
  DocumentId: string;
  DocumentVersionId: string | null;
  ParentId: string | null;
  ProjectId: string | null;
  ProductId: string | null;
  CustomerId: string | null;
  ShortcutTo: string | null;
  Shortcut: boolean | null;

  Name: string | any;
  Extensions: string[];
  Size: number | null;
  Hidden: boolean | null;
  Type: string;

  Expanded: boolean | null;
  Compressed: boolean;
  OrderId: number | null;
  LockId: string | null;

  Notes: string | null;
  Description: string | null;
  Keywords: string | null;
  // List<KeyValuePair<Guid?,String>> RestorePath ;
  LatestThumbnailDocumentVersionId: string | null;
  PermissionCode: string;
  RestorePath: string[];
  UploadUri: string | null;
  ShortUrl: string | null;

  CreatedOn: Date | null;
  CreatedById: string;
  CreatedBy: string;
  VersionCreatedBy: string;
  VersionCreatedOn: Date | null;
  VersionCreatedById: string | null;
  ModifiedOn: Date | null;
  ModifiedById: string | null;
  ModifiedBy: string | null;
  DeletedOn: Date | null;
  DeletedById: string | null;
  // Dictionary<string, string> PathDocument ;
  DocumentVersionIds: string[];
  DocumentChildrenIds: string[];
}

export class DocumentApiModel  {
  DocumentId: string = '1111';
  DocumentVersionId: string | null = null;
  ParentId: string | null = null;
  ProjectId: string | null = null;
  ProductId: string | null = null;
  CustomerId: string | null = null;
  ShortcutTo: string | null = null;
  Shortcut: boolean | null = false;

  Name: any | string = '';
  Extensions: string[] = [];
  Size: number | null = null;
  Hidden: boolean | null = false;
  Type: string = '';

  Expanded: boolean | null = false;
  Compressed: boolean = false;
  OrderId: number | null = null;
  LockId: string | null = null;

  Notes: string | null = null;
  Description: string | null = null;
  Keywords: string | null = null;
  // List<KeyValuePair<Guid?,String>> RestorePath ;
  LatestThumbnailDocumentVersionId: string | null = null;
  PermissionCode: string = '';
  RestorePath: string[] = [];
  UploadUri: string | null = null;
  ShortUrl: string | null = null;
  selectedDrawing: boolean | undefined;

  CreatedOn: Date | null = new Date();
  CreatedById: string = '1111';
  CreatedBy: string = '';
  VersionCreatedBy: string = '';
  VersionCreatedOn: Date | null = null;
  VersionCreatedById: string | null = null;
  ModifiedOn: Date | null = null;
  ModifiedById: string | null = null;
  ModifiedBy: string | null = null;
  DeletedOn: Date | null = null;
  DeletedById: string | null = null;
  // Dictionary<string, string> PathDocument ;
  DocumentVersionIds: string[] = [];
  DocumentChildrenIds: string[] = [];
  objId: string | null = null;

  title: string | null = null;
  extension: string | null = null;
  created_at: string | null = null;
  icon: string | null = null;
  Index: string | null = null;

  constructor(data?: IDocumentApiModel) {
    //super();
    if (data) {
      for (const property in data) {
        if (data.hasOwnProperty(property)) {
          (<any>this)[property] = (<any>data)[property];
        }
      }
    }
  }

  getObjectType(): string {
    return 'DocumentApiModel';
  }

  getObjectKey(): string {
    return this.DocumentId || '';
  }

  getObjectHash(): any {
    return this.ModifiedOn;
  }

  getObjectTitle(): string {
    return this.Name || '';
  }

  getParentKey(): string | undefined {
    return this.ParentId || undefined;
  }

  getOrderId(): number | undefined {
    return this.OrderId || 1;
  }
  getObjectDisabled(): boolean {
    return false;

  }

  isFolder(): boolean {
    return this.Type!.endsWith('FOLDER');
  }

  hasViewer(){
    return this.Extensions.some((ext:string) => ['pdf', 'obj', 'stl', 'dae', 'ifc', 'mp4', 'mkv', 'ogv', 'webm', 'mov'].includes(ext.toLowerCase().replace('.','')));
  }


}
