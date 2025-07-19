# Configurare Tabelă Maintenance Requests

Pentru a activa funcționalitatea de solicitări de mentenanță, trebuie să executați scriptul SQL pentru a crea tabela necesară.

## Pași de urmat:

### 1. Accesați Supabase Dashboard
- Mergeți la [https://supabase.com](https://supabase.com)
- Conectați-vă la proiectul dvs.

### 2. Navigați la SQL Editor
- În meniul din stânga, click pe "SQL Editor"

### 3. Executați scriptul
- Copiați întregul conținut din fișierul `create-maintenance-table.sql`
- Lipiți-l în SQL Editor
- Click pe butonul "Run" (sau Ctrl+Enter)

### 4. Verificați crearea tabelei
- Mergeți la "Table Editor" în meniul din stânga
- Ar trebui să vedeți tabela `maintenance_requests` în listă

## Structura tabelei:

Tabela `maintenance_requests` conține următoarele câmpuri:
- `id` - identificator unic
- `user_id` - referință către utilizator
- `title` - titlul solicitării
- `description` - descriere detaliată
- `category` - categoria (plumbing, electrical, heating, cleaning, other)
- `priority` - prioritatea (low, medium, high, urgent)
- `status` - statusul (pending, in_progress, completed, cancelled)
- `location` - locația problemei
- `assigned_to` - persoana responsabilă (opțional)
- `estimated_cost` - cost estimat (opțional)
- `actual_cost` - cost real (opțional)
- `completion_date` - data finalizării
- `created_at` - data creării
- `updated_at` - data ultimei modificări

## Politici de securitate:

Tabela are RLS (Row Level Security) activat cu următoarele reguli:
- Utilizatorii pot vedea doar propriile solicitări
- Administratorii pot vedea toate solicitările
- Utilizatorii pot crea solicitări noi
- Doar administratorii pot actualiza și șterge solicitări

## Troubleshooting:

Dacă întâmpinați erori:
1. Verificați că sunteți conectat la proiectul corect
2. Asigurați-vă că aveți permisiuni de administrator
3. Verificați că nu există deja o tabelă cu același nume
4. Consultați logurile în Supabase Dashboard > Logs

Pentru suport suplimentar, contactați echipa tehnică.