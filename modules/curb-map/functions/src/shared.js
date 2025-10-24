const generateMetadata = (fsContext, actionRequest) => ({
    createdAt: fsContext.serverTimestamp(),
    createdBy: actionRequest.actorId,
    updatedAt: fsContext.serverTimestamp(),
    updatedBy: actionRequest.actorId,
})

const updatedMetadata = (fsContext, actionRequest) => ({
    updatedAt: fsContext.serverTimestamp(),
    updatedBy: actionRequest.actorId,
})

export { generateMetadata, updatedMetadata }
