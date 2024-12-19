# Useful Commands
*These commands should be used for debugging or for big changes in the server structure.*

# Commands for systemctl
*3 important modules of systemctl (use as `<name>` in commands):*
- `ekeel` (Video Annotation App)
- `ekeel-wp3` (Video Augmentation App)
- `nginx` (Global connection for the server)

```bash
# Enable systemctl
sudo systemctl enable <name>

# View info about status
sudo systemctl status <name>

# Start the app
sudo systemctl start <name>

# Stop the app
sudo systemctl stop <name>

# Check app logs
sudo journalctl -u <name>
```
