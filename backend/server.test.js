const request = require('supertest');
const express = require('express');

// Mock de AWS SDK pour les tests
jest.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: jest.fn(() => ({
      scan: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Items: [] })
      }),
      put: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
      }),
      get: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          Item: { id: 'test-id', title: 'Test Task', status: 'pending' }
        })
      }),
      update: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          Attributes: { id: 'test-id', title: 'Updated Task', status: 'completed' }
        })
      }),
      delete: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
      })
    }))
  }
}));

// Import de l'app après le mock
const app = require('./server');

describe('Todo Backend API', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'todo-backend');
    });
  });

  describe('Tasks API', () => {
    it('should get all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should create a new task', async () => {
      const newTask = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title', newTask.title);
    });

    it('should not create task without title', async () => {
      const invalidTask = {
        description: 'Task without title',
        status: 'pending'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should get a specific task', async () => {
      const taskId = 'test-id';

      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', taskId);
    });

    it('should update a task', async () => {
      const taskId = 'test-id';
      const updateData = {
        title: 'Updated Task',
        status: 'completed'
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('title', updateData.title);
    });

    it('should delete a task', async () => {
      const taskId = 'test-id';

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});
