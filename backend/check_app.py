from app import create_app
try:
    app = create_app()
    print("App created successfully")
    print("Registered Blueprints:", app.blueprints.keys())
except Exception as e:
    print(f"Failed to create app: {e}")
    import traceback
    traceback.print_exc()
