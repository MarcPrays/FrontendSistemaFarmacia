# Sistema de Autenticación JWT

Este proyecto implementa autenticación JWT para integrarse con un backend FastAPI.

## 📋 Configuración

### 1. URL del Backend

La URL del backend se configura en `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000' // Cambiar según tu backend FastAPI
};
```

Para producción, actualiza `src/environments/environment.prod.ts`.

### 2. Endpoint de Login en FastAPI

El servicio de autenticación espera un endpoint POST en `/auth/login` que reciba:

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response (éxito):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role_id": 1
  }
}
```

**Response (error):**
```json
{
  "detail": "Email o contraseña incorrectos"
}
```

## 🏗️ Arquitectura

### Servicio de Autenticación (`auth.service.ts`)

El servicio `AuthService` maneja:
- Login y logout
- Almacenamiento de tokens en localStorage
- Validación de tokens JWT
- Gestión del estado del usuario autenticado

**Métodos principales:**
- `login(credentials)` - Inicia sesión
- `logout()` - Cierra sesión
- `isAuthenticated()` - Verifica si hay sesión activa
- `getToken()` - Obtiene el token actual
- `getCurrentUser()` - Obtiene los datos del usuario

### Interceptor HTTP (`auth.interceptor.ts`)

Agrega automáticamente el header `Authorization: Bearer <token>` a todas las peticiones HTTP.

Si recibe un error 401, automáticamente cierra la sesión y redirige al login.

### Guard de Rutas (`auth.guard.ts`)

Protege las rutas que requieren autenticación. Si el usuario no está autenticado, redirige al login.

### Componente de Login (`login.component.ts`)

Componente de login con validación de formularios y manejo de errores.

## 🔒 Flujo de Autenticación

1. **Usuario accede a ruta protegida** → El guard verifica autenticación
2. **No autenticado** → Redirige a `/login`
3. **Usuario ingresa credenciales** → Se envía petición a `/auth/login`
4. **Backend valida** → Retorna token JWT y datos del usuario
5. **Frontend guarda token** → Se almacena en localStorage
6. **Peticiones subsecuentes** → El interceptor agrega el token automáticamente
7. **Token expira o error 401** → Cierra sesión y redirige al login

## 📝 Uso en Componentes

### Verificar autenticación:

```typescript
import { AuthService } from './services/auth.service';

constructor(private authService: AuthService) {}

ngOnInit() {
  if (this.authService.isAuthenticated()) {
    // Usuario autenticado
  }
}
```

### Obtener usuario actual:

```typescript
const user = this.authService.getCurrentUser();
console.log(user?.email);
```

### Observar cambios del usuario:

```typescript
this.authService.currentUser$.subscribe(user => {
  if (user) {
    console.log('Usuario logueado:', user);
  } else {
    console.log('Usuario no logueado');
  }
});
```

### Cerrar sesión:

```typescript
this.authService.logout();
```

## 🛠️ Backend FastAPI - Ejemplo de Endpoint

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta

app = FastAPI()

SECRET_KEY = "tu-secret-key-super-secreta"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@app.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Validar credenciales
    user = authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crear token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "id": user.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role_id": user.role_id
        }
    }

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

## 📌 Notas Importantes

1. **CORS**: Asegúrate de configurar CORS en FastAPI para permitir peticiones desde `http://localhost:4200` (o tu dominio de desarrollo).

2. **Seguridad**: El token se almacena en `localStorage`. Considera usar `httpOnly` cookies para mayor seguridad en producción.

3. **Refresh Token**: Este ejemplo usa solo access token. Para producción, considera implementar refresh tokens.

4. **Validación de Token**: El frontend valida la expiración del token leyendo el payload. El backend siempre debe validar también.

## 🔧 Troubleshooting

**Error: "Error de conexión"**
- Verifica que el backend FastAPI esté ejecutándose
- Verifica que la URL en `environment.ts` sea correcta
- Verifica CORS en el backend

**Error 401 después de login**
- Verifica que el endpoint retorne el formato correcto
- Verifica que el token se esté guardando correctamente
- Revisa la consola del navegador para más detalles

