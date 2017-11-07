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