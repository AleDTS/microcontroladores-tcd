import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import { CameraPreview } from '@ionic-native/camera-preview';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { File } from '@ionic-native/file';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
    public pairedDevices: Array<any[]>;
    public unpairedDevices: Array<any[]>;
    private alertPaired: any;
    private alertUnpaired: any;

    constructor(
        public navCtrl: NavController,
        private cameraPreview: CameraPreview,
        private bluetoothSerial: BluetoothSerial,
        private file: File,
        private alertCtrl: AlertController,
    ) {
        this.enableBluetooth();

        this.startcamera();

        // this.searchBluetooth();
    }

    // CAMERA METHODS ----------------------------------------------------------
    takePicture(){
      this.cameraPreview.takePicture({

      }).then((base64PictureData) => {
          console.log("Picture taken")
          this.sendByte();
      }).catch((err) => {
          alert('Não foi possível tirar a foto: '+err)
      })
    }

    startcamera(){
        this.cameraPreview.startCamera({
          x: 0,
          y: 0,
          width: window.screen.width,
          height: window.screen.height,
          camera: this.cameraPreview.CAMERA_DIRECTION.BACK,
          toBack: true,
          tapPhoto: true,
          previewDrag: false
        }).then((msg)=>{
            console.log('Camera started')
        }).catch((err)=>{
            console.log('Camera not started: '+err)
            if (err != 'Camera already started')
                alert('Não foi possível iniciar a camera: '+err)
        });
    }
    // BLUETOOTH METHODS -------------------------------------------------------
    enableBluetooth(){
        this.bluetoothSerial.isEnabled()
            .then((msg) => {
                console.log('Bluetooth is enabled: '+msg);
            })
            .catch((err) => {
                this.bluetoothSerial.enable()
                    .then((msg) => {
                        console.log('Bluetooth is enabled: '+msg);
                    })
                    .catch((err) => {
                        console.log('Bluetooth is not enabled');
                        alert('O bluetooth não está ligado: ' +err);
                    })
            })
    }

    searchBluetooth(){
        this.bluetoothSerial.list().then(()=>{

            this.bluetoothSerial.connect('00:21:13:00:4F:0D').subscribe((msg)=>{
                alert('Dispositivo conectado! '+ msg)
            }, (err) => {
                alert('Nao foi possivel conectar com o dispositivo: '+ err)
            })
        })
        // let btDevices = this.alertCtrl.create();
        // btDevices.setTitle('Dispositivos');
        // btDevices.setMessage('Conecte-se com o dispositivo bluetooth');
        // btDevices.addButton({
        //     text: 'Conectar',
        //     handler: (data) => {
        //         console.log(data)
        //         this.bluetoothSerial.connect(data).subscribe()
        //         // this.bluetoothSerial.isConnected()
        //         //     .then((msg)=>{
        //         //         console.log('Bluetooth is connected: '+msg)
        //         //         alert('Bluetooth está conectado!')
        //         //         // this.setConfig()
        //         //         return
        //         //     }).catch((err)=>{
        //         //         console.log('Bluetooth isnt connected: '+err)
        //         //         alert('Bluetooth não está conectado!')
        //         //         this.searchBluetooth();
        //         //     })
        //         return false
        //     }
        // })
        // btDevices.addButton({
        //     text: 'Procurar',
        //     handler: (data) => {
        //         this.bluetoothSerial.discoverUnpaired()
        //             .then((devices) => {
        //                 devices.forEach((d) => {
        //                     console.log(d.name);
        //                     btDevices.addInput({
        //                         type: 'radio',
        //                         label: d.name,
        //                         value: d.id,
        //                         checked: false
        //                     })
        //                 })
        //             }).catch((err) => {
        //                 console.log('Cant search devices: '+err)
        //                 alert('Nao foi possivel achar dispositivos: '+err)
        //             })
        //         btDevices.present();
        //     }
        // })
        // this.bluetoothSerial.list()
        //     .then((devices) => {
        //         devices.forEach((d) => {
        //             console.log(d.name);
        //             btDevices.addInput({
        //                 type: 'radio',
        //                 label: d.name,
        //                 value: d.id,
        //                 checked: false
        //             })
        //         })
        //         btDevices.present();
        //     }).catch((err) => {
        //         console.log('Cant search devices: '+err)
        //         alert('Nao foi possivel achar dispositivos: '+err)
        //     })
    }

    sendByte(){
        var byte = new Uint8Array(1)
        var data
        byte[0] = 1
        data = byte.buffer
        this.bluetoothSerial.write(data)
            .then((msg)=>{
                console.log('Byte sent! :) = '+ data + ' ' + typeof(data))
            }).catch((err)=>{
                console.log('Byte not sent! :( ' + err)
            })
    }
}
