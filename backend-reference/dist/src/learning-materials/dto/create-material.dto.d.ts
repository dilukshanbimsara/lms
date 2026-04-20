export declare enum MaterialType {
    PDF = "PDF",
    NOTE = "NOTE",
    VIDEO = "VIDEO"
}
export declare class CreateMaterialDto {
    title: string;
    type: MaterialType;
    subject: string;
    level: string;
    content?: string;
    fileUrl?: string;
    uploaderId?: string;
}
