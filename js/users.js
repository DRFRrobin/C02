function getUsers(){
  return JSON.parse(localStorage.getItem('users')) || [];
}
function saveUsers(u){
  localStorage.setItem('users', JSON.stringify(u));
}
const current = JSON.parse(sessionStorage.getItem('currentUser'));
if(!current || current.role!=='admin'){
  window.location.href = 'index.html';
}
const table = document.getElementById('userTable');
const nameInput = document.getElementById('userName');
const passInput = document.getElementById('userPass');
const roleInput = document.getElementById('userRole');
const saveBtn = document.getElementById('saveUser');
let editIndex = null;

function render(){
  table.innerHTML='';
  getUsers().forEach((u,i)=>{
    const row = document.createElement('tr');
    row.innerHTML = `<td>${u.username}</td><td>${u.role}</td><td><button data-edit="${i}">Edit</button> <button data-del="${i}">Supprimer</button></td>`;
    table.appendChild(row);
  });
}

table.addEventListener('click',e=>{
  if(e.target.dataset.edit){
    const u=getUsers()[e.target.dataset.edit];
    nameInput.value=u.username;
    passInput.value=u.password;
    roleInput.value=u.role;
    editIndex=e.target.dataset.edit;
  }else if(e.target.dataset.del){
    const users=getUsers();
    users.splice(e.target.dataset.del,1);
    saveUsers(users);
    render();
  }
});

saveBtn.addEventListener('click',()=>{
  const users=getUsers();
  const u={username:nameInput.value,password:passInput.value,role:roleInput.value};
  if(editIndex===null){
    users.push(u);
  }else{
    users[editIndex]=u;
    editIndex=null;
  }
  saveUsers(users);
  nameInput.value='';
  passInput.value='';
  roleInput.value='user';
  render();
});

render();
