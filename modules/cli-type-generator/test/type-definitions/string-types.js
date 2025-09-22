const REGEX = {
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    lowerCaseDashSeparated: /^[a-z0-9][a-z0-9-]*$/,
    emailRegex: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    nameRegex: '^[^±!@£$%^&*_+§¡€#¢§¶•ªº«\\\\/<>?:;|=.,]*$',
    simpleName: /^[a-zA-Z0-9_ -]+$/,
    organizationSize: /1-10|11-50|51-250|251-1000|1001-5000|5000[+]/,
    imageUri: '/^data:image\\/(png|jpeg|svg\\+xml);base64,[A-Za-z0-9+/]+={0,2}$/i',
}

const StringTypes = {
    Id: REGEX.uuid.toString(),
    OptionalId: REGEX.uuid.toString() + '?',
    Ids: `[${REGEX.uuid.toString()}]`,
    OptionalIds: `[${REGEX.uuid.toString()}]?`,
    IconName: REGEX.lowerCaseDashSeparated.toString(),
    Email: REGEX.emailRegex.toString(),
    OptionalEmail: REGEX.emailRegex.toString() + '?',

    OrganizationRole: '/Admin|Collaborator|Guest/',
    OptionalOrganizationRole: '/Admin|Collaborator|Guest/?',

    // these need to be better
    OptionalCountryCode: 'String?',
    OptionalTimezone: 'String?',
    OptionalPhoneNumber: 'String?',
    OptionalMeasurementUnits: '/Imperial|Metric/?',
    OptionalUrl: 'String?',
    Url: 'String',
    OptionalImageUri: REGEX.imageUri + '?',
    CommentParentType: '/Collaboration|Feature|Upload/',
    ProjectType: /ARCHITECTURE_ID|CONSTRUCTION_ID|LANDSCAPING_ID|RETROFIT_ID|OTHER_ID/,
    OptionalOrganizationSize: REGEX.organizationSize.toString() + '?',

    // simple aliases
    Color: 'String', // TODO: make more strict
    HexColor: /#[0-9a-fA-F]{6}/,
}

export { REGEX }
export default StringTypes
