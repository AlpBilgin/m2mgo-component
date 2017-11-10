// This comes directly from M2MGO backend
export enum ColumnType {
    UniqueIdentifier = 0,    // Map to a Guid
    DateTime = 1,            // Map to a DateTime
    Number = 2,              // Map to a Number      
    Integer = 3,             // Map to a Integer
    Boolean = 4,             // Map to a Boolean
    String = 5,              // Map to a String
    Reference = 6,           // is not used yet
    ListOfReferences = 7,    // is not used yet
    Image = 8                // Map to a String
}

// This converter function exists to map the backend data types to JS primitives.
export function ColumnTypeToPrimitives(input: number): string {
    switch (input) {
        case ColumnType.UniqueIdentifier: return "string";
        case ColumnType.DateTime: return "string";
        case ColumnType.Number: return "number";
        case ColumnType.Integer: return "number";
        case ColumnType.Boolean: return "boolean";
        case ColumnType.String: return "string";
        case ColumnType.Reference: return "string";
        case ColumnType.ListOfReferences: return "string";
        case ColumnType.Image: return "string";
        default: return "string";
    }
}