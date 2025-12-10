import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-users',
  imports: [CommonModule],
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
        role_id: 1,
        first_name: 'Admin',
        last_name: 'Principal',
        email: 'admin@farmacia.com',
        status: 1,
        fullName: 'Admin Principal',
        avatar: '👨‍💼'
      },
      {
        id: 2,
        role_id: 2,
        first_name: 'Vendedor',
        last_name: 'Uno',
        email: 'vendedor@farmacia.com',
        status: 1,
        fullName: 'Vendedor Uno',
        avatar: '👤'
      }
    ];
  }

  getActiveUsersCount(): number {
    return this.users.filter(user => user.status === 1).length;
  }

  getInactiveUsersCount(): number {
    return this.users.filter(user => user.status === 0).length;
  }
}
