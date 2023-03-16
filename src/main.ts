import { keyboard, Key } from "@nut-tree/nut-js";
import { app, BrowserWindow, dialog } from "electron";
import { SerialPort } from "serialport";

async function createWindow() {
  const arduinos = await SerialPort.list();

  if (arduinos.length < 1) {
    dialog.showErrorBox(
      "TOMBOL TIDAK DITEMUKAN!",
      "Modul tombol tidak dapat ditemukan, mohon untuk mengecek kembali koneksi dengan modul tombol"
    );

    process.exit();
  }

  const actualArduino = arduinos[0];

  const arduinoConnection = new SerialPort({
    path: actualArduino.path,
    baudRate: 9600,
  });

  const mainWindow = new BrowserWindow({
    kiosk: true,
    autoHideMenuBar: true,
  });
  mainWindow.removeMenu();

  mainWindow.loadURL("http://localhost:3000");

  arduinoConnection.on("data", async (data) => {
    switch (data.toString("utf8").trim()) {
      case "SORA-KEYBIND-ESC":
        await keyboard.type(Key.Escape);
        break;
      case "SORA-KEYBIND-1":
        await keyboard.type("1");
        break;
      case "SORA-KEYBIND-2":
        await keyboard.type("2");
        break;
      case "SORA-KEYBIND-3":
        await keyboard.type("3");
        break;
      case "SORA-KEYBIND-ENTER":
        await keyboard.type(Key.Enter);
        break;
    }
  });

  const onErrorOrClose = () => {
    mainWindow.close();
    dialog.showErrorBox(
      "TOMBOL TERPUTUS",
      "Koneksi dengan tombol terputus, silahkan cek kembali modul tombol"
    );

    process.exit();
  };

  arduinoConnection.on("error", onErrorOrClose);
  arduinoConnection.on("close", onErrorOrClose);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
