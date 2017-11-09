import { ColumnType } from "./models/enums";

// This converter function exists to map the backend data types to JS datatypes.
export function columnTypeToString(input: number): string {
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