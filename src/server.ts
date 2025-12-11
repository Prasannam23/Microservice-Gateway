import { createApp } from './app';

const PORT = parseInt(process.env.PORT || '4000', 10);

const startServer = async (): Promise<void> => {
  try {
    console.log(`Creating Apollo/Express app...`);
    const app = await createApp();
    console.log(`App created successfully, starting HTTP server on port ${PORT}...`);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`GraphQL Gateway running on http://localhost:${PORT}/graphql`);
      console.log(`Health endpoint: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
