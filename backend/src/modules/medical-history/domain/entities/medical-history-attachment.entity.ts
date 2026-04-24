export type MedicalHistoryAttachmentProps = {
    id: string;
    entryId: string;
    fileName: string;
    fileMimeType: string;
    fileSizeBytes: number;
    s3Bucket: string;
    s3Key: string;
    uploadedByUserId: string;
    createdAt: Date;
};

export class MedicalHistoryAttachment {
    private constructor(private props: MedicalHistoryAttachmentProps) {}

    static create(props: Omit<MedicalHistoryAttachmentProps, 'createdAt'>): MedicalHistoryAttachment {
        return new MedicalHistoryAttachment({ ...props, createdAt: new Date() });
    }

    static rehydrate(props: MedicalHistoryAttachmentProps): MedicalHistoryAttachment {
        return new MedicalHistoryAttachment(props);
    }

    get id() { return this.props.id; }
    get entryId() { return this.props.entryId; }
    get fileName() { return this.props.fileName; }
    get fileMimeType() { return this.props.fileMimeType; }
    get fileSizeBytes() { return this.props.fileSizeBytes; }
    get s3Bucket() { return this.props.s3Bucket; }
    get s3Key() { return this.props.s3Key; }
    get uploadedByUserId() { return this.props.uploadedByUserId; }
    get createdAt() { return this.props.createdAt; }
}
