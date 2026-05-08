import os

# Dossiers à ignorer
EXCLUDED_DIRS = {
    ".venv",
    "venv",
    "env",
    "node_modules",
    ".git",
    "__pycache__"
}

def delete_migrations(root_dir):
    for root, dirs, files in os.walk(root_dir):
        # Filtrer les dossiers à ignorer
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]

        if "migrations" in dirs:
            migrations_path = os.path.join(root, "migrations")

            for file in os.listdir(migrations_path):
                file_path = os.path.join(migrations_path, file)

                if file == "__init__.py":
                    continue

                if file.endswith(".py") or file.endswith(".pyc"):
                    os.remove(file_path)
                    print(f"Deleted: {file_path}")

if __name__ == "__main__":
    project_path = os.path.dirname(os.path.abspath(__file__))
    delete_migrations(project_path)
    print("✅ Migrations supprimées (avec exclusions).")