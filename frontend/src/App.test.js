import { render, screen } from '@testing-library/react';
import App from './App';

// Mock axios pour les tests
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: []
      }
    }),
    post: jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'test-id',
          title: 'Test Task',
          description: 'Test Description',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    }),
    put: jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'test-id',
          title: 'Updated Task',
          description: 'Updated Description',
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    }),
    delete: jest.fn().mockResolvedValue({
      data: {
        success: true
      }
    })
  }))
}));

// Mock pour éviter les erreurs de console dans les tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('App Component', () => {
  test('renders todo list title', () => {
    render(<App />);
    const titleElement = screen.getByText(/todo list/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders project subtitle', () => {
    render(<App />);
    const subtitleElement = screen.getByText(/projet fil rouge/i);
    expect(subtitleElement).toBeInTheDocument();
  });

  test('renders add task form', () => {
    render(<App />);
    const formTitle = screen.getByText(/ajouter une nouvelle tâche/i);
    expect(formTitle).toBeInTheDocument();
  });

  test('renders title input field', () => {
    render(<App />);
    const titleInput = screen.getByLabelText(/titre/i);
    expect(titleInput).toBeInTheDocument();
  });

  test('renders description textarea', () => {
    render(<App />);
    const descriptionTextarea = screen.getByLabelText(/description/i);
    expect(descriptionTextarea).toBeInTheDocument();
  });

  test('renders status select', () => {
    render(<App />);
    const statusSelect = screen.getByLabelText(/statut/i);
    expect(statusSelect).toBeInTheDocument();
  });

  test('renders add task button', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /ajouter la tâche/i });
    expect(addButton).toBeInTheDocument();
  });

  test('renders tasks list section', () => {
    render(<App />);
    const tasksSection = screen.getByText(/mes tâches/i);
    expect(tasksSection).toBeInTheDocument();
  });
});
