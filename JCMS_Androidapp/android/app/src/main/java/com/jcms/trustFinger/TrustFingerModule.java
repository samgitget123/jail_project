package com.jcms.trustFinger;

import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.net.Uri;
import android.os.AsyncTask;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.Log;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;

import com.aratek.trustfinger.common.CommonUtil;
import com.aratek.trustfinger.sdk.DeviceListener;
import com.aratek.trustfinger.sdk.DeviceOpenListener;
import com.aratek.trustfinger.sdk.FingerPosition;
import com.aratek.trustfinger.sdk.ImgCompressAlg;
import com.aratek.trustfinger.sdk.LfdLevel;
import com.aratek.trustfinger.sdk.LfdStatus;
import com.aratek.trustfinger.sdk.SecurityLevel;
import com.aratek.trustfinger.sdk.TrustFinger;
import com.aratek.trustfinger.sdk.TrustFingerDevice;
import com.aratek.trustfinger.sdk.TrustFingerException;
import com.aratek.trustfinger.sdk.VerifyResult;
import com.facebook.common.file.FileUtils;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableNativeArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

public class TrustFingerModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "TrustFinger";
    private TrustFinger mTrustFinger;
    protected TrustFingerDevice mTrustFingerDevice;
    private byte[] fpImage_Raw = null;
    private int imageQuality = 0;
    private byte[] fpImage_bmp = null;
    private Bitmap fpImage_bitmap = null;
    private int mImageQualityThrethold = 50;
    private String mFeatureFormat = "bione";
    private byte[] fpFeatureData = null;
    private byte[] fpImage_Data = null;
    private String mImageFormat = "bmp";
    private boolean isCaturing = false;
    private boolean isVerifing = false;
    private final LargestFingerData largestFingerData = new LargestFingerData();
    private CaptureTask mCaptureTask;
    private VerifyTask mVerifyTask;
    private String rootPath = Config.COMMON_PATH + "/FingerData/";
    private SecurityLevel mSecurityLevel = SecurityLevel.Level1;
    private static ReactApplicationContext reactContext;

    public TrustFingerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void initTrustFinger(Promise promise) {
        Log.i("TAG", "initTrustFinger");
        try {
            mTrustFinger = TrustFinger.getInstance(reactContext);
            mTrustFinger.initialize();
            Log.i("TAG", "DEVICE COUNT:" + mTrustFinger.getDeviceCount());

            int deviceIndex = 0;
            mTrustFinger.openDevice(deviceIndex, new DeviceOpenListener() {
                @Override
                public void openSuccess(TrustFingerDevice trustFingerDevice) {
                    Log.i("TAG", "DEVICE DETAILS:" + String.valueOf(trustFingerDevice));
                    mTrustFingerDevice = trustFingerDevice;
                    WritableMap resultData = new WritableNativeMap();
                    resultData.putString("deviceInfo", String.valueOf(trustFingerDevice));
                    promise.resolve(resultData);
                }

                @Override
                public void openFail(String msg) {
                    Log.i("Error:", msg);
                }
            });

        } catch (TrustFingerException e) {
            Log.e("TAG", "ERROR:" + e.getType().toString());
            if (e.getType().toString().equals("DEVICE_NOT_FOUND")) {
                WritableMap resultData = new WritableNativeMap();
                resultData.putString("deviceInfo", e.getType().toString());
                promise.resolve(resultData);
            }
            e.printStackTrace();
        } catch (ArrayIndexOutOfBoundsException e) {
            // showAlertDialog(true, "The system does not support simultaneous access to two
            // devices" +
            // ".");
        }
    }

    @ReactMethod
    public void captureRawData(boolean isVerifyFinger,Promise promise) {
        try {
            if (!isCaturing) {
                mCaptureTask = new CaptureTask(isVerifyFinger, promise);
                mCaptureTask.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
            }
        } catch (TrustFingerException e) {
            Log.i("Error:", e.toString());
        }
    }

    @ReactMethod
    public void isSameFinger(String imagePath1, String imagePath2, String imagePath3, Promise promise) {

        VerifyResult result = null;
        InputStream iStream = null;
        WritableMap resultData = null;
        Uri uri1 = Uri.fromFile(new File(imagePath1));
        Uri uri2 = Uri.fromFile(new File(imagePath2));
        Uri uri3 = Uri.fromFile(new File(imagePath3));

        try {
            iStream = getReactApplicationContext().getContentResolver().openInputStream(uri1);
            byte[] fpFeatureData1 = getBytes(iStream);

            iStream = getReactApplicationContext().getContentResolver().openInputStream(uri2);
            byte[] fpFeatureData2 = getBytes(iStream);

            iStream = getReactApplicationContext().getContentResolver().openInputStream(uri3);
            byte[] fpFeatureData3 = getBytes(iStream);

            result = mTrustFingerDevice.verify(SecurityLevel.Level4, fpFeatureData1,
                    fpFeatureData2);
            if (result.error == 0 && result.isMatched) {
                result = mTrustFingerDevice.verify(SecurityLevel.Level4, fpFeatureData1,
                        fpFeatureData3);
                if (result.error == 0 && result.isMatched) {
                    result = mTrustFingerDevice.verify(SecurityLevel.Level4, fpFeatureData2,
                            fpFeatureData3);
                    if (result.error == 0 && result.isMatched) {
                        resultData = new WritableNativeMap();
                        resultData.putBoolean("isSameFinger", true);
                        promise.resolve(resultData);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            resultData = new WritableNativeMap();
            resultData.putBoolean("isSameFinger", false);
            promise.resolve(resultData);
        }
        resultData = new WritableNativeMap();
        resultData.putBoolean("isSameFinger", false);
        promise.resolve(resultData);
    }

    @ReactMethod
    public void verifyFinger(String fpFeatureData1, String fpFeatureData2, Promise promise) {
        try {
            Log.i("TAG", "PATH 1:" + fpFeatureData1);
            Log.i("TAG", "PATH 2:" + fpFeatureData2);

            WritableMap resultData = null;

            byte[] path1 = Base64.decode(fpFeatureData1, 1);
            byte[] path2 = Base64.decode(fpFeatureData2, 1);
            VerifyResult result = mTrustFingerDevice.verify(mSecurityLevel, path1,
                    path2);
            Log.i("TAG", "RES:" + result.toString());
            Log.i("TAG", "RES:" + result.isMatched);
            resultData = new WritableNativeMap();
            resultData.putBoolean("isVerifyFinger", result.isMatched);
            promise.resolve(resultData);
        } catch (TrustFingerException e) {
            Log.e("TAG 3", "Verify exception: " + e.getType().toString());
            e.printStackTrace();
        }
    }

    // file to byte[], old and classic way, before Java 7

    @ReactMethod
    public void verify(String path, int position, Promise promise) {
        Log.i("TAG", "verify");
        Log.i("TAG", "imagePath:" + path);
        Log.i("TAG", "position:" + position);

        try {
            if (!isVerifing) {
                Log.i("TAG", "path:" + path);
                byte[] path1 = Base64.decode(path, 1);
                mVerifyTask = new VerifyTask(path1, position, promise);
                mVerifyTask.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
            }
        } catch (TrustFingerException e) {
            Log.i("TrustFingerException:", e.toString());
        }
    }

    private class VerifyTask extends AsyncTask<Void, Integer, Void> {
        Promise mPromise = null;
        byte[] path = null;
        int fingerPos = 0;
        private VerifyResult result;
        WritableMap resultData = Arguments.createMap();

        public VerifyTask(byte[] imagePath, int fingerPosition, Promise promise) {
            super();
            Log.i("TAG", "VerifyTask=>=>");
            mPromise = promise;
            path = imagePath;
            fingerPos = fingerPosition;
        }

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            isVerifing = true;
        }

        @Override
        protected Void doInBackground(Void... voids) {
            largestFingerData.clear();
            Log.i("TAG", "Image Path:" + path);
            do {
                if (mTrustFingerDevice == null) {
                    Log.e("TAG", "Device not opened 1");
                    break;
                }
                boolean isFakeFinger = false;
                if (largestFingerData.isIsrRaise()) {
                    largestFingerData.setIsrRaise(false);
                }

                try {
                    if (mTrustFingerDevice.getLfdLevel() != LfdLevel.OFF) {
                        int[] lfdStatus = new int[1];
                        fpImage_Raw = mTrustFingerDevice.captureRawDataLfd(lfdStatus);
                        if (lfdStatus[0] == LfdStatus.FAKE) {
                            Log.e("TAG", "fake finger");
                            isFakeFinger = true;
                        } else if (lfdStatus[0] == LfdStatus.UNKNOWN) {
                            Log.e("TAG", "unknown finger");
                        } else {
                            Log.e("TAG", "");
                        }
                    } else {
                        fpImage_Raw = mTrustFingerDevice.captureRawData();
                    }
                    if (fpImage_Raw == null) {
                        imageQuality = 0;
                        publishProgress(0);
                        resultData = Arguments.createMap();
                        resultData.putBoolean("isMatched", false);
                        reactContext
                                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("isMatched", resultData);
                    } else {
                        if (mTrustFingerDevice == null) {
                            // mHandler.sendMessage(mHandler.obtainMessage
                            // (MSG_VERIFY_WARNING, "Device not opened"));
                            Log.e("TAG", "Device not opened");
                            break;
                        }
                        fpImage_bmp = mTrustFingerDevice.rawToBmp(fpImage_Raw, mTrustFingerDevice
                                .getImageInfo().getWidth(),
                                mTrustFingerDevice.getImageInfo()
                                        .getHeight(),
                                mTrustFingerDevice.getImageInfo().getResolution());
                        if (fpImage_bmp == null) {
                            publishProgress(0);
                            continue;
                        }
                        fpImage_bitmap = BitmapFactory.decodeByteArray(fpImage_bmp, 0, fpImage_bmp.length);
                        if (mTrustFingerDevice == null) {
                            Log.e("TAG", "Device not opened");
                            break;
                        }
                        imageQuality = mTrustFingerDevice.rawDataQuality(fpImage_Raw);
                        publishProgress(imageQuality);
                        resultData = Arguments.createMap();
                        resultData.putBoolean("isMatched", false);
                        reactContext
                                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("isMatched", resultData);
                        if (imageQuality >= mImageQualityThrethold && !isFakeFinger) {
                            if (mTrustFingerDevice == null) {
                                Log.e("TAG", "Device not opened");
                                break;
                            }
                            fpFeatureData = mTrustFingerDevice.extractFeature(fpImage_Raw,
                                    FingerPosition.Unknown);
                            if (fpFeatureData != null) {
                                if (!largestFingerData.isThreshold()) {
                                    largestFingerData.setThreshold(true);
                                }
                                if (imageQuality > largestFingerData.getImgQuality()) {
                                    largestFingerData.update(fpFeatureData, imageQuality, fpImage_bitmap);
                                }
                            } else {
                                Log.e("TAG", "Extract feature failed!");
                            }
                        }
                    }
                    if (!isFakeFinger && (imageQuality < 20 || imageQuality == 0) && !largestFingerData.isIsrRaise()
                            && largestFingerData.getImgQuality() >= mImageQualityThrethold) {
                        fpFeatureData = largestFingerData.getFpFeatureData();
                        publishProgress(largestFingerData.getImgQuality());
                        resultData = Arguments.createMap();
                        resultData.putBoolean("isMatched", false);
                        reactContext
                                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("isMatched", resultData);
                        break;
                    }
                } catch (TrustFingerException e) {
                    Log.e("TAG", "Verify exception: " + e.getType().toString());
                    e.printStackTrace();
                }
            } while (true);
            if (fpFeatureData == null) {
                mVerifyTask = null;
                isVerifing = false;
                return null;
            }
            try {
                boolean matched = false;
                resultData = Arguments.createMap();
                if (path != null && fingerPos != 0) {
                    if (mTrustFingerDevice == null) {
                        Log.e("TAG", "Device not opened");
                        mVerifyTask = null;
                        isVerifing = false;
                        return null;
                    }
                    result = mTrustFingerDevice.verify(mSecurityLevel, path, fpFeatureData);

                    if (result.error == 0) {
                        resultData.putBoolean("isMatched", result.isMatched);
                    }
                } else {
                    Log.i("TAG", "verify fail, no enrolled template");
                }
                reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("isMatched", resultData);
            } catch (TrustFingerException e) {
                Log.e("TAG", "Verify exception: " + e.getType().toString());
                e.printStackTrace();
                mVerifyTask = null;
                isVerifing = false;
                return null;
            }
            mVerifyTask = null;
            isVerifing = false;

            return null;
        }
    }

    private class CaptureTask extends AsyncTask<Void, Integer, Void> {
        Promise mPromise = null;
        boolean isVerifyFin = false;
        WritableMap resultData = new WritableNativeMap();

        public CaptureTask(boolean isVerifyFinger,Promise promise) {
            super();
            mPromise = promise;
            isVerifyFin = isVerifyFinger;
        }

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            isCaturing = true;
        }

        @Override
        protected Void doInBackground(Void... voids) {
            boolean isThreshold = false;
            largestFingerData.clear();
            do {
                if (mTrustFingerDevice == null) {
                    Log.e("TAG", "Device not opened 1");
                    break;
                }
                boolean isFakeFinger = false;
                if (largestFingerData.isIsrRaise()) {
                    largestFingerData.setIsrRaise(false);
                }
                try {
                    if (mTrustFingerDevice.getLfdLevel() != LfdLevel.OFF) {
                        int[] lfdStatus = new int[1];
                        fpImage_Raw = mTrustFingerDevice.captureRawDataLfd(lfdStatus);
                        if (lfdStatus[0] == LfdStatus.FAKE) {
                            isFakeFinger = true;
                        } else if (lfdStatus[0] == LfdStatus.UNKNOWN) {
                            Log.e("TAG", "unknown finger");
                        } else {
                            Log.e("TAG", "");
                        }
                    } else {
                        fpImage_Raw = mTrustFingerDevice.captureRawData();
                    }
                    if (fpImage_Raw == null) {
                        imageQuality = 0;
                        publishProgress(0);
//                        resultData = Arguments.createMap();
//                        resultData.putString("capturedImagePath", "");
//                        resultData.putBoolean("isVerifyFinger", isVerifyFin);
//                        resultData.putBoolean("isScanned", false);
//                        reactContext
//                                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
//                                .emit("capturedImage", resultData);
                    } else {
                        if (mTrustFingerDevice == null) {
                            Log.e("TAG", "Device not opened");
                            break;
                        }
                        fpImage_bmp = mTrustFingerDevice.rawToBmp(fpImage_Raw,
                                mTrustFingerDevice.getImageInfo().getWidth(),
                                mTrustFingerDevice.getImageInfo().getHeight(), mTrustFingerDevice
                                        .getImageInfo().getResolution());

                        if (mTrustFingerDevice == null) {
                            Log.e("TAG", "Device not opened");
                            break;
                        }

                        switch (mImageFormat) {
                            case "bmp":
                                fpImage_Data = fpImage_bmp;
                                break;
                            case "wsq":
                                fpImage_Data = mTrustFingerDevice.rawToWsq(fpImage_Raw,
                                        mTrustFingerDevice.getImageInfo().getWidth(),
                                        mTrustFingerDevice.getImageInfo().getHeight(),
                                        mTrustFingerDevice.getImageInfo().getResolution());
                                break;
                            case "raw":
                                fpImage_Data = fpImage_Raw;
                                break;
                            case "iso-fir":
                                fpImage_Data = mTrustFingerDevice.rawToISO(fpImage_Raw,
                                        mTrustFingerDevice.getImageInfo().getWidth(),
                                        mTrustFingerDevice.getImageInfo().getHeight(),
                                        mTrustFingerDevice.getImageInfo().getResolution(), FingerPosition.LeftThumb,
                                        ImgCompressAlg.UNCOMPRESSED_NO_BIT_PACKING);
                                break;
                            case "ansi-fir":
                                fpImage_Data = mTrustFingerDevice.rawToANSI(fpImage_Raw,
                                        mTrustFingerDevice.getImageInfo().getWidth(),
                                        mTrustFingerDevice.getImageInfo().getHeight(),
                                        mTrustFingerDevice.getImageInfo().getResolution(), FingerPosition.LeftThumb,
                                        ImgCompressAlg.UNCOMPRESSED_NO_BIT_PACKING);
                                break;
                        }

                        if (fpImage_bmp == null) {
                            publishProgress(0);
//                            resultData = Arguments.createMap();
//                            resultData.putString("capturedImagePath", "");
//                            resultData.putBoolean("isVerifyFinger", isVerifyFin);
//                            resultData.putBoolean("isScanned", false);
//                            reactContext
//                                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
//                                    .emit("capturedImage", resultData);
                            continue;
                        }
                        fpImage_bitmap = BitmapFactory.decodeByteArray(fpImage_bmp, 0, fpImage_bmp.length);
                        Log.i("TAG", "Bitmap Data:" + fpImage_bitmap.toString());
                        if (mTrustFingerDevice == null) {
                            Log.e("TAG", "Device not opened");
                            break;
                        }
                        imageQuality = mTrustFingerDevice.rawDataQuality(fpImage_Raw);
                        publishProgress(imageQuality);
//                        resultData = Arguments.createMap();
//                        resultData.putString("capturedImagePath", "");
//                        resultData.putBoolean("isVerifyFinger", isVerifyFin);
//                        reactContext
//                                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
//                                .emit("capturedImage", resultData);

                        if (imageQuality >= mImageQualityThrethold && !isFakeFinger) {
                            try {
                                if (mTrustFingerDevice == null) {
                                    Log.e("TAG", "Device not opened");
                                    break;
                                }
                                if (!isThreshold) {
                                    isThreshold = true;
                                }
                                switch (mFeatureFormat) {
                                    case "iso-fmr":// ISO
                                        fpFeatureData = mTrustFingerDevice.extractFeature(fpImage_Raw,
                                                FingerPosition.LeftThumb);
                                        Log.e("TAG", "doInBackground: " + Arrays.toString(fpFeatureData));
                                        Log.e("TAG", "fpFeatureData: " + fpFeatureData.length);
                                        Log.i("TAG", "fpImage_Data 6:" + fpImage_Data);
                                        break;
                                    case "ansi-fmr":// ANSI
                                        fpFeatureData = mTrustFingerDevice.extractANSIFeature(fpImage_Raw,
                                                FingerPosition.LeftThumb);
                                        Log.i("TAG", "fpImage_Data 7:" + fpImage_Data);
                                        break;
                                    case "bione":// BIONE
                                        fpFeatureData = mTrustFingerDevice.extractFeature(fpImage_Raw,
                                                FingerPosition.LeftThumb);
                                        Log.i("TAG", "fpImage_Data 8:" + fpImage_Data);
                                        break;
                                }
                                Log.i("TAG", "FingerData Length:" + fpFeatureData.length);
                                Log.i("TAG", "FingerData:" + fpFeatureData);
                                if (imageQuality > largestFingerData.getImgQuality()) {
                                    Log.i("TAG", "fpImage_Data 9:" + fpImage_Data);
                                    largestFingerData.update(fpImage_Data, fpFeatureData, imageQuality, fpImage_bitmap);
                                }
                            } catch (TrustFingerException e) {
                                mCaptureTask = null;
                                isCaturing = false;
                                fpFeatureData = null;
                                Log.e("TAG", "Capture exception:: " + e.getType().toString());
                                e.printStackTrace();
                                break;
                            }
                        }
                    }

                    if (!isFakeFinger && (imageQuality < 20 || imageQuality == 0) && !largestFingerData.isIsrRaise()
                            && largestFingerData.getImgQuality() >= mImageQualityThrethold) {
                        Log.i("TAG", "Inside If");
                        saveFingerData(largestFingerData.getFpImageData(), largestFingerData.getFpFeatureData(),
                                largestFingerData.getImgQuality());
                        publishProgress(largestFingerData.getImgQuality());
                        resultData = Arguments.createMap();
                        String encodedString = Base64.encodeToString(fpFeatureData, Base64.DEFAULT);
                        fpFeatureData = largestFingerData.getFpFeatureData();
                        resultData.putString("capturedImagePath", encodedString);
                        resultData.putBoolean("isVerifyFinger", isVerifyFin);
                        reactContext
                                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("capturedImage", resultData);
                        mCaptureTask = null;
                        isCaturing = false;
                        break;
                    }
                } catch (TrustFingerException e) {
                    mCaptureTask = null;
                    isCaturing = false;
                    Log.e("TAG", "Capture exception:" + e.getType().toString());
                    e.printStackTrace();
                    break;
                }
            } while (true);
//            isCaturing = false;
            return null;
        }
    }

    public void saveFile(byte[] data, String fileName) throws RuntimeException {
        File mainPicture = new File(rootPath, fileName);
        try {
            FileOutputStream fos = new FileOutputStream(mainPicture);
            fos.write(data);
            fos.close();
        } catch (Exception e) {
            throw new RuntimeException("Image could not be saved.", e);
        }
    }

    private String getRealPathFromURI(Uri contentUri) {
        Cursor cursor = null;
        try {
            String[] proj = { MediaStore.Images.Media.DATA };
            cursor = getReactApplicationContext().getContentResolver().query(contentUri,  proj, null, null, null);
            int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
            cursor.moveToFirst();
            return cursor.getString(column_index);
        } catch (Exception e) {
            Log.e("TAG", "getRealPathFromURI Exception : " + e.toString());
            return "";
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
    }

    public Uri getImageUri(Bitmap inImage) {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        inImage.compress(Bitmap.CompressFormat.JPEG, 100, bytes);
        String time = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date(System.currentTimeMillis()));
        String path = MediaStore.Images.Media.insertImage(reactContext.getContentResolver(), inImage, time, null);
        Log.i("TAG", "Image Path:" + path);
        return Uri.parse(path);
    }

    private String saveFingerData(byte[] fpImageData, byte[] fpFeatureData, final int imgQuality) {
        try {
            File root = new File(rootPath);
            if (!root.exists()) {
                root.mkdirs();
            }
            String time = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date(System.currentTimeMillis()));
            String imageFileName = mTrustFingerDevice.getDeviceDescription().getProductModel() + "_" + time + "_"
                    + FingerPosition.LeftThumb.name() + "_" + imgQuality + "." + mImageFormat;
            String minitaesFileName = mTrustFingerDevice.getDeviceDescription().getProductModel() + "_" + time + "_"
                    + FingerPosition.LeftThumb.name() + "_" + imgQuality + "." + mFeatureFormat;
            // String imageFileName = "AratekTrustFinger_" + time + "_" +
            // mFingerPosition.name() + "_" + imgQuality + "." + mImageFormat;
            // String minitaesFileName = "AratekTrustFinger_" + time + "_" +
            // mFingerPosition.name() + "_" + imgQuality + "." + mFeatureFormat;

                CommonUtil.saveData(rootPath + "/" + imageFileName, fpImageData);
                CommonUtil.saveData(rootPath + "/" + minitaesFileName, fpFeatureData);
                String imageFilePath = rootPath + "/" + imageFileName;
                String minitaesFilePath = rootPath + "/" + minitaesFileName;

                Log.i("TAG", "imageFilePath:" + imageFilePath);
                Log.i("TAG", "minitaesFilePath:" + minitaesFilePath);


            Log.e("TAG", mTrustFingerDevice.getDeviceDescription().toString());
            mCaptureTask = null;
            isCaturing = false;
            Log.i("TAG", "Capture success");
            return minitaesFilePath;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public byte[] getBytes(InputStream inputStream) throws IOException {
        ByteArrayOutputStream byteBuffer = new ByteArrayOutputStream();
        int bufferSize = 1024;
        byte[] buffer = new byte[bufferSize];

        int len = 0;
        while ((len = inputStream.read(buffer)) != -1) {
            byteBuffer.write(buffer, 0, len);
        }
        return byteBuffer.toByteArray();
    }

    public byte[] getBytesFromImagePath(String imagePath) {
        // Only decode image size. Not whole image
        BitmapFactory.Options option = new BitmapFactory.Options();
        option.inJustDecodeBounds = true;
        BitmapFactory.decodeFile(imagePath, option);

        // Minimum width and height are > NEW_SIZE (e.g. 380 * 720)
        final int NEW_SIZE = 480;

        // Now we have image width and height. We should find the correct scale value.
        // (power of 2)
        int width = option.outWidth;
        int height = option.outHeight;
        int scale = 1;
        while (width / 2 > NEW_SIZE || height / 2 > NEW_SIZE) {
            width /= 2;// ww w . j a va 2 s.co m
            height /= 2;
            scale++;
        }
        // Decode again with inSampleSize
        option = new BitmapFactory.Options();
        option.inSampleSize = scale;

        Bitmap bitmap = BitmapFactory.decodeFile(imagePath, option);
        ByteArrayOutputStream stream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, 80, stream);
        bitmap.recycle();

        return stream.toByteArray();
    }
}
