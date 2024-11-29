@echo off
start pwsh.exe -c "cd backend; npm start" & start pwsh.exe -c "cd frontend; npm start"