const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];


function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(400).json({error: "User not found"});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const checkUser = users.find((user) => user.username === username);
  if(checkUser){
    return response.status(400).json({error: "Usera already exists"});
  }


  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const findToDos = users.find((usr) => usr.username === username);

  return response.status(200).json(findToDos.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const { user } = request;
  
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const todoFound = user.todos.find((todo) => todo.id === id);
  
  if(!todoFound) {
    return response.status(404).json({error: "Todo not found"});
  }

  todoFound.title = title;
  todoFound.deadline = deadline;

  return response.status(200).json(todoFound);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { user } = request;
  const { id } = request.params;

  const todoFound = user.todos.find((todo) => todo.id === id);

  if(!todoFound){
    return response.status(404).json({error: "Todo not found"});
  }

  todoFound.done = true;

  return response.status(200).json(todoFound);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { user } = request;

  const filteredTodos = user.todos.find((todo) => todo.id === id);

  if(!filteredTodos) {
    return response.status(404).json({error: "Todo not found"});
  }
  
  user.todos.splice(filteredTodos,1);

  return response.status(204).send();
});

module.exports = app;