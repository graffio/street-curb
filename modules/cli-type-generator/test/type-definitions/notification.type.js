// Tagged sum type definition for Notification with Date fields

// prettier-ignore
export const Notification = {
    name: 'Notification',
    kind: 'taggedSum',
    variants: {
        Scheduled: { message: 'String', scheduledFor: 'Date' },
        Sent:      { message: 'String', sentAt: 'Date', deliveredAt: 'Date?' },
        Expired:   { message: 'String', expiredAt: 'Date' },
    },
}
