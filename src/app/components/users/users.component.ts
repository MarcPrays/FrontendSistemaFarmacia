import { Component, OnInit} from '@angular/core';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit{
 users: User[] = [];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.users = [
      {
        id: 1,
        avatar: '👨‍💼',
        fullName: 'Mr Hannes Kröll',
        email: 'hannes.kroll@example.com',
        phone: '0014-4585757',
        location: 'Goch, Germany'
      }
      // Puedes agregar más usuarios aquí
    ];
  }
}
