const HOPSWORKS_APP_PREFIX = "/hopsworks-api/pythonapp";

function trimSlashes(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

function encodePathSegment(segment: string): string {
  return encodeURIComponent(segment);
}

export function getHopsworksPublicBasePath(): string {
  const explicitBasePath = trimSlashes(process.env.NEXT_PUBLIC_BASE_PATH ?? "");
  if (explicitBasePath) {
    return `/${explicitBasePath}`;
  }

  const projectName = process.env.HOPSWORKS_PROJECT_NAME?.trim();
  const jobName = process.env.HOPSWORKS_JOB_NAME?.trim();
  if (!projectName || !jobName) {
    return "";
  }

  return `${HOPSWORKS_APP_PREFIX}/${encodePathSegment(projectName)}/${encodePathSegment(jobName)}`;
}
