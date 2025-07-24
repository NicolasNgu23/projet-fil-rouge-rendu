const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// AWS Configuration
const dynamoDbConfig = {
  region: process.env.AWS_REGION || 'eu-west-3'
};

// For local development with DynamoDB Local
if (process.env.DYNAMODB_ENDPOINT) {
  dynamoDbConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
  dynamoDbConfig.accessKeyId = process.env.AWS_ACCESS_KEY_ID || 'dummy';
  dynamoDbConfig.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || 'dummy';
}

const dynamoDb = new AWS.DynamoDB.DocumentClient(dynamoDbConfig);

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'todo-tasks';

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'todo-backend'
  });
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAME
    };

    const result = await dynamoDb.scan(params).promise();
    res.json({
      success: true,
      data: result.Items || []
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks'
    });
  }
});

// Get task by ID
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const params = {
      TableName: TABLE_NAME,
      Key: { id }
    };

    const result = await dynamoDb.get(params).promise();
    
    if (!result.Item) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: result.Item
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task'
    });
  }
});

// Create new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const task = {
      id: uuidv4(),
      title,
      description: description || '',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const params = {
      TableName: TABLE_NAME,
      Item: task
    };

    await dynamoDb.put(params).promise();

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task'
    });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (title !== undefined) {
      updateExpression.push('#title = :title');
      expressionAttributeNames['#title'] = 'title';
      expressionAttributeValues[':title'] = title;
    }

    if (description !== undefined) {
      updateExpression.push('description = :description');
      expressionAttributeValues[':description'] = description;
    }

    if (completed !== undefined) {
      updateExpression.push('completed = :completed');
      expressionAttributeValues[':completed'] = completed;
    }

    updateExpression.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET ' + updateExpression.join(', '),
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDb.update(params).promise();

    res.json({
      success: true,
      data: result.Attributes
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      ReturnValues: 'ALL_OLD'
    };

    const result = await dynamoDb.delete(params).promise();

    if (!result.Attributes) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/health`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`DynamoDB Table: ${TABLE_NAME}`);
    console.log(`AWS Region: ${process.env.AWS_REGION || 'eu-west-3'}`);
  });
}

// Export app for testing
module.exports = app;
