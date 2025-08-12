### Mi Energía en Casa

App Next.js para calcular consumo, costos y emisiones de energía en el hogar en Chile. Ingreso por RUT (validación local) y región. Guarda escenarios localmente y, opcionalmente, sincroniza en Firebase.

#### Requisitos
- Node.js 18+

#### Instalación
```bash
npm install
npm run dev
```
Abre `http://localhost:3000`.

#### Configurar Firebase (opcional)
1. Crea un proyecto en Firebase.
2. Habilita Firestore.
3. Copia `.env.example` a `.env.local` y pega tus credenciales Web.
4. Reinicia `npm run dev`.

Los escenarios se guardan en `ruts/{RUT}/scenarios`.

> Nota: Las reglas de seguridad por defecto de Firestore podrían requerir ajustes antes de producción.

#### Despliegue en Vercel
1. Sube este repo a GitHub.
2. En Vercel, importa el repo.
3. Añade tus variables de entorno (`NEXT_PUBLIC_FIREBASE_*`).
4. Deploy.

#### Estructura
- `app/` páginas (App Router)
- `lib/` utilidades (RUT, cálculos, formatos, Firebase)
- `styles/` Tailwind global

#### Roadmap (opcional)
- Autenticación Firebase (anónima o email link) para escenarios privados
- Promedios por región (desafío comunidad)
- Historial y gráficos
- Modo educativo con infografías 