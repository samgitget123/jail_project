package com.jcms;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbManager;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class USBModule  extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    private final BroadcastReceiver usbReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (UsbManager.ACTION_USB_DEVICE_ATTACHED.equals(action)) {
                sendUsbConnectionEvent(true);
            } else if (UsbManager.ACTION_USB_DEVICE_DETACHED.equals(action)) {
                sendUsbConnectionEvent(false);
            }
        }
    };

    public USBModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        registerUsbReceiver();
    }

    private void registerUsbReceiver() {
        IntentFilter filter = new IntentFilter();
        filter.addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED);
        filter.addAction(UsbManager.ACTION_USB_DEVICE_DETACHED);
        reactContext.registerReceiver(usbReceiver, filter);
    }

    private void sendUsbConnectionEvent(boolean isConnected) {
    reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit("usbConnection", isConnected);
}

    @NonNull
    @Override
    public String getName() {
        return "UsbModule";
    }

    @ReactMethod
    public void startUsbDetection() {
        // No action needed here, registration is done in the constructor
    }

    @ReactMethod
    public void stopUsbDetection() {
        reactContext.unregisterReceiver(usbReceiver);
    }
}
