const generateMetadata = (fsContext, actionRequest) => ({
    createdAt: new Date(),
    createdBy: actionRequest.actorId,
    updatedAt: new Date(),
    updatedBy: actionRequest.actorId,
})

const updatedMetadata = (fsContext, actionRequest) => ({ updatedAt: new Date(), updatedBy: actionRequest.actorId })

export { generateMetadata, updatedMetadata }
