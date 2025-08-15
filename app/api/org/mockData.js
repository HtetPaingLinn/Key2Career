// Shared in-memory storage for mock job posts (for development/testing)
let mockJobPosts = [];

export const addMockJobPost = (jobPost) => {
  mockJobPosts.push(jobPost);
  console.log(`Added mock job post: ${jobPost.id}`);
};

export const getMockJobPosts = (orgEmail) => {
  return mockJobPosts.filter((job) => job.orgEmail === orgEmail);
};

export const getAllMockJobPosts = () => {
  return mockJobPosts;
};

export const removeMockJobPost = (jobId) => {
  const initialLength = mockJobPosts.length;
  mockJobPosts = mockJobPosts.filter((job) => job.id !== jobId);
  const removed = initialLength !== mockJobPosts.length;

  if (removed) {
    console.log(`Removed mock job post: ${jobId}`);
  } else {
    console.log(`Mock job post not found: ${jobId}`);
  }

  return removed;
};
