@echo off
REM Docker startup script for UTH-ConfMS (Windows)

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   UTH-ConfMS Docker Startup (Windows)
echo ========================================
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed
    echo It should come with Docker Desktop
    pause
    exit /b 1
)

REM Create .env if it doesn't exist
if not exist .env (
    echo [INFO] Creating .env file from template...
    if exist .env.example (
        copy .env.example .env
        echo.
        echo [WARNING] Please edit .env with your configuration before running again
        pause
        exit /b 1
    ) else (
        echo [ERROR] .env.example not found!
        pause
        exit /b 1
    )
)

REM Get command from arguments (default: up)
set "ACTION=%1"
if "%ACTION%"=="" set "ACTION=up"

REM Handle commands
if /i "%ACTION%"=="up" goto cmd_up
if /i "%ACTION%"=="start" goto cmd_up
if /i "%ACTION%"=="down" goto cmd_down
if /i "%ACTION%"=="stop" goto cmd_down
if /i "%ACTION%"=="restart" goto cmd_restart
if /i "%ACTION%"=="logs" goto cmd_logs
if /i "%ACTION%"=="rebuild" goto cmd_rebuild
if /i "%ACTION%"=="clean" goto cmd_clean
if /i "%ACTION%"=="shell" goto cmd_shell
goto show_help

:cmd_up
echo [INFO] Building Docker images...
call docker-compose build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo [INFO] Starting services...
call docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo [INFO] Waiting for database to be ready...
timeout /t 10 /nobreak

echo.
echo ========================================
echo [SUCCESS] Services started!
echo ========================================
echo.
echo Access points:
echo   Frontend:     http://localhost:3000
echo   Backend API:  http://localhost:5000
echo   API Docs:     http://localhost:5000/api/docs
echo.
echo Useful commands:
echo   docker-run.bat logs        - View logs
echo   docker-run.bat down        - Stop services
echo   docker-run.bat restart     - Restart services
echo.
pause
goto :eof

:cmd_down
echo [INFO] Stopping services...
call docker-compose down
echo [SUCCESS] Services stopped
pause
goto :eof

:cmd_restart
echo [INFO] Restarting services...
call docker-compose restart
echo [SUCCESS] Services restarted
pause
goto :eof

:cmd_logs
call docker-compose logs -f
goto :eof

:cmd_rebuild
echo [INFO] Rebuilding Docker images...
call docker-compose build --no-cache
call docker-compose up -d
echo [SUCCESS] Rebuilt and restarted
pause
goto :eof

:cmd_clean
echo [WARNING] This will remove all containers and volumes!
set /p "confirm=Continue? (yes/no): "
if /i "%confirm%"=="yes" (
    call docker-compose down -v
    echo [SUCCESS] Cleaned up
) else (
    echo [CANCELLED] Cleanup cancelled
)
pause
goto :eof

:cmd_shell
echo [INFO] Accessing backend shell...
call docker-compose exec backend bash
goto :eof

:show_help
echo Usage: docker-run.bat [command]
echo.
echo Commands:
echo   up          - Build and start all services (default)
echo   down        - Stop all services
echo   restart     - Restart all services
echo   logs        - View logs
echo   rebuild     - Rebuild images
echo   clean       - Remove containers and volumes
echo   shell       - Enter backend shell
echo.
pause
goto :eof
