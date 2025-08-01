# Curb Management Application - Business Requirements

## Overview
Multi-tenant SaaS application for cities to manage and collect curb use data. Cities upload GeoJSON street data, field workers collect detailed curb measurements, and cities can export data in various formats including Curb Data Specification (CDS) format.

## Core Business Model
- **Target Customers**: Cities and municipalities
- **Pricing**: Annual fixed fee (thousands/year, check payment)
- **Multi-tenant**: Each city's data is completely isolated
- **Data Hosting**: We host all city data securely

## Primary Use Case: Field Data Collection
1. **User Authentication**: City employees sign in with role-based access
2. **Street Selection**: Pick unmeasured streets from city's uploaded GeoJSON
3. **Field Collection**: Walk with measuring roller + mobile web app
4. **Data Entry**: Record curb segment types, lengths, and regulations
5. **Offline Capability**: Must work without internet connection
6. **Data Sync**: Upload measurements when connection restored

## Technical Architecture

### Firebase Services Stack
```
Authentication → Firebase Auth + Optional SSO Integration (SAML/OAuth with city providers)
Database → Cloud SQL (PostgreSQL for spatial data)
Storage → Firebase Storage (raw GeoJSON files)
Functions → Cloud Functions (data processing, webhooks)
Hosting → Firebase Hosting (PWA for mobile web)
```

### Data Flow
```
City Uploads GeoJSON → Firebase Storage → Processed → Firestore/Cloud SQL
User Collects Data → Mobile Web App → Firestore/Cloud SQL → Processed
Webhook Triggers → Cloud Functions → Update GeoJSON → Notify City
```

## Data Model

### Multi-Tenant Structure
```javascript
cities: {
  cityId: {
    name: string,
    subscription: {
      tier: 'basic|premium|enterprise',
      annualAmount: number,
      startDate: timestamp,
      endDate: timestamp
    },
    users: {
      userId: {
        role: 'admin|user|viewer',
        permissions: [...]
      }
    }
  }
}

streets: {
  cityId: {
    streetId: {
      geojson: object,
      curbSegments: [...],
      lastUpdated: timestamp,
      updatedBy: userId
    }
  }
}
```

## User Roles & Permissions
- **Admin**: Full access to city data, user management, exports
- **User**: Field data collection, view city data
- **Viewer**: Read-only access to city data
- **Webhook**: Authenticated API access for data updates

### Authentication Requirements
- **City SSO Integration**: Workers would like to log in with city credentials (SAML/OAuth)
- **Fallback to Firebase Auth**: Native Firebase authentication as backup option
- **Role Mapping**: Map city roles to application permissions
- **Session Management**: Handle city SSO session timeouts
- **Public Data Access**: Read access to curb data is public
- **Write Access Control**: Strict authentication required for data modifications

## Data Export Requirements

### Export Formats
- **GeoJSON**: Raw street geometry and curb data
- **CSV**: Tabular data for analysis
- **Shapefile**: GIS system compatibility
- **Curb Data Specification (CDS)**: [Open Mobility Foundation standard](https://www.openmobilityfoundation.org/about-cds/)

### CDS Export Requirements
- **Curbs API**: Export curb locations and regulations
- **Events API**: Export real-time and historic curb events
- **Metrics API**: Export usage statistics and dwell times
- **Compliance**: Must follow CDS specification exactly

### Export Options
- **Full Dataset**: Complete city curb data
- **Incremental**: Data changed since specified date
- **Filtered**: By street, date range, or curb type
- **Scheduled**: Automated exports via webhook

## Data Processing Pipeline

### GeoJSON Processing
- **Street Segmentation**: Break streets into measurable blocks
- **Data Validation**: Ensure curb measurements are valid
- **Conflict Resolution**: Handle multiple users measuring same street
- **Data Versioning**: Track changes over time

### Quality Assurance
- **Measurement Validation**: Check for reasonable curb lengths
- **Spatial Validation**: Ensure segments fit within street boundaries
- **Conflict Detection**: Identify overlapping measurements
- **Data Reconciliation**: Merge multiple measurements

## Mobile Web Requirements

### Progressive Web App (PWA)
- **Offline Functionality**: Must work without internet
- **GPS Integration**: Auto-locate user on correct street
- **Touch Optimization**: Optimized for field data entry
- **Background Sync**: Upload when connection restored

### Field Data Collection
- **Measurement Entry**: Length, type, regulations
- **Photo Documentation**: Optional curb photos
- **GPS Tracking**: Verify location accuracy
- **Conflict Detection**: Warn about overlapping work

## Audit & Compliance

### Change Tracking
- **Who changed what when**: Complete audit trail
- **Data lineage**: Track from collection to export
- **User activity**: Login, data access, exports
- **Compliance reporting**: For city requirements

### Data Security
- **Encryption**: At rest and in transit
- **Access logging**: For compliance requirements
- **Data residency**: Where data is stored
- **Backup strategy**: RTO/RPO requirements

### Security Requirements
- **Public Data Access**: Curb data is public information, read access is unrestricted
- **Write Access Control**: Strict authentication required for data modifications
- **Audit Logging**: Track all data modifications and user activities
- **Access Management**: Role-based access control (RBAC) for data changes
- **Data Integrity**: Ensure data accuracy and prevent unauthorized modifications
- **SOC2 Consideration**: May be required by some cities, evaluate per customer

### SOC2 Compliance Requirements
- **Security Controls**: Multi-factor authentication, session management, rate limiting
- **Access Management**: Role-based access control (RBAC) with custom claims
- **Audit Logging**: Comprehensive audit trails for all data access and changes
- **Change Management**: Documented change control procedures and version tracking
- **Vendor Management**: Firebase services assessment and monitoring
- **Incident Response**: Documented incident response procedures and alerting
- **Business Continuity**: Disaster recovery and backup procedures
- **Annual Audits**: Third-party SOC2 Type II certification when required

## Billing & Subscription Management

### Annual Billing
- **Fixed annual fee**: Thousands per year
- **Check payments**: Traditional billing process
- **Usage tracking**: Monitor data volume per city
- **Tiered pricing**: Different service levels

### Invoice Management
- **Professional invoicing**: PDF generation
- **Payment tracking**: Check receipt confirmation
- **Renewal management**: Annual contract renewals
- **Usage reporting**: Data volume and feature usage

## Dashboard & Analytics

### Change Tracking Dashboard
- **Data changes over time**: Visual timeline
- **User activity**: Who made what changes
- **Filtering options**: By date, user, street, type
- **Sorting capabilities**: Multiple sort criteria

### Analytics
- **Collection progress**: Percentage of streets measured
- **Data quality metrics**: Validation results
- **User productivity**: Field worker efficiency
- **Export usage**: Download frequency and volume

## Integration Points

### City Systems
- **GIS Integration**: Export to city mapping systems
- **Data Standards**: Compliance with city formats
- **Webhook Reliability**: Retry logic, error handling
- **API Rate Limits**: Prevent abuse

### External Services
- **Payment Processing**: Handle check payments
- **Support System**: Help desk integration
- **Email Notifications**: Export completion alerts
- **SMS Alerts**: Critical system notifications

## Performance & Scale Considerations

### Data Volume
- **Large GeoJSON files**: Handle 100MB+ files
- **Spatial indexing**: For efficient street queries
- **Caching strategy**: For frequently accessed data
- **CDN integration**: For global city access

### Concurrent Usage
- **Multiple field workers**: Per city
- **Real-time updates**: During data collection
- **Export generation**: Large dataset processing
- **Webhook processing**: High-volume event handling

## Business Operations

### Customer Onboarding
- **City setup process**: Initial configuration
- **Data migration**: Import existing GeoJSON
- **User training**: Field worker orientation
- **Support handoff**: Ongoing assistance

### Support System
- **Help desk integration**: Ticket management
- **User documentation**: Field collection guides
- **Video tutorials**: Mobile app usage
- **Phone support**: Critical issue resolution

## Missing Considerations to Address

### Technical
- **Data versioning strategy**: How to handle schema changes
- **API versioning**: Long-term compatibility
- **Feature flags**: Gradual rollout capability
- **Monitoring**: System health and performance
- **Security monitoring**: Real-time threat detection and alerting
- **Performance monitoring**: Response time and throughput tracking
- **Error tracking**: Comprehensive error logging and alerting
- **Backup verification**: Automated backup testing and recovery procedures

### Business
- **Customer success**: Onboarding and retention
- **Sales process**: City procurement cycles
- **Competitive analysis**: Other curb management tools
- **Market expansion**: Additional use cases

### Compliance
- **Data retention**: How long to keep data
- **Privacy regulations**: GDPR, CCPA compliance
- **City-specific requirements**: Local data policies
- **Audit requirements**: Financial and technical audits
- **SOC2 Evaluation**: Assess per customer requirements
- **SSO Integration**: Optional city identity provider integration
- **Security controls**: Basic security framework implementation
- **SOC2 Documentation**: Security policies, procedures, and control matrices
- **Incident Response**: Documented procedures for security incidents
- **Change Management**: Formal change control and deployment procedures

## Success Metrics

### Technical
- **Data accuracy**: Measurement precision
- **System uptime**: 99.9% availability
- **Export speed**: Large dataset processing time
- **Mobile performance**: Field app responsiveness

### Business
- **Customer retention**: Annual renewal rate
- **Data completeness**: Percentage of streets measured
- **Export frequency**: Customer engagement
- **Support volume**: Customer satisfaction

## Risk Mitigation

### Technical Risks
- **Data loss**: Comprehensive backup strategy
- **Performance issues**: Load testing and monitoring
- **Security breaches**: Regular security audits
- **Integration failures**: Robust error handling
- **SSO failures**: City identity provider outages (if using SSO)
- **Data integrity**: Unauthorized modifications to public data

### Business Risks
- **Customer churn**: Strong onboarding and support
- **Competition**: Continuous feature development
- **Regulatory changes**: Flexible compliance framework
- **Economic factors**: Diversified customer base 