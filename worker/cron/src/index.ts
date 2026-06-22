interface Env {
  CF_API_TOKEN: string;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const accountId = '3d2c7278332e1314ee55afa8743dd6bc';
    const projectName = 'personal-website';

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ branch: 'master' }),
      }
    );

    if (!response.ok) {
      console.error('Failed to trigger deployment:', await response.text());
      throw new Error('Deployment trigger failed');
    }

    console.log('Deployment triggered successfully');
  },
};
