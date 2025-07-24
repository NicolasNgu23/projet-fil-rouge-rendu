# DynamoDB Table for Todo Tasks
resource "aws_dynamodb_table" "todo_tasks" {
  name         = "todo-tasks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name        = "todo-tasks"
    Environment = "dev"
  }
}

# Sample data for testing (optional)
resource "aws_dynamodb_table_item" "sample_task" {
  table_name = aws_dynamodb_table.todo_tasks.name
  hash_key   = aws_dynamodb_table.todo_tasks.hash_key

  item = jsonencode({
    id = {
      S = "sample-task-1"
    }
    title = {
      S = "Sample Todo Task"
    }
    description = {
      S = "This is a sample task created by Terraform"
    }
    completed = {
      BOOL = false
    }
    createdAt = {
      S = "2025-01-24T10:00:00Z"
    }
  })
}
