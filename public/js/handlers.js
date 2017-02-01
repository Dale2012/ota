/* Demo Note:  This demo uses a FileProgress class that handles the UI for displaying the file name and percent complete.
The FileProgress class is not part of SWFUpload.
*/


/* **********************
   Event Handlers
   These are my custom event handlers to make my
   web application behave the way I went when SWFUpload
   completes different tasks.  These aren't part of the SWFUpload
   package.  They are part of my application.  Without these none
   of the actions SWFUpload makes will show up in my application.
   ********************** */
function fileQueued(file) {
	try {
		var progress = new FileProgress(file, this.customSettings.progressTarget);
		progress.setStatus("等待中...");
		progress.toggleCancel(true, this);

	} catch (ex) {
		this.debug(ex);
	}

}

function fileQueueError(file, errorCode, message) {
	try {
		if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
			alert("正在上传前一个应用，请等待该应用上传完后提交");
			return;
		}

		var progress = new FileProgress(file, this.customSettings.progressTarget);
		progress.setError();
		progress.toggleCancel(false);

		switch (errorCode) {
		case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
			progress.setStatus("请上传不超过50MB的文件");
			this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
			progress.setStatus("不能上传空文件");
			this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
			progress.setStatus("文件类型错误");
			this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		default:
			if (file !== null) {
				progress.setStatus("不能处理的异常");
			}
			this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		}
	} catch (ex) {
        this.debug(ex);
    }
}

function fileDialogComplete(numFilesSelected, numFilesQueued) {
	try {
		if (numFilesSelected > 0) {
			document.getElementById(this.customSettings.cancelButtonId).disabled = false;
		}

		/* I want auto start the upload and I can do that here */
		this.startUpload();
	} catch (ex)  {
        this.debug(ex);
	}
}

/*
 * 定义一个文件上传前要执行的业务逻辑
 */
function uploadStart(file) {
    var pingCode = $('#pingCode').val();
    if(pingCode !=''){
	try {
		var progress = new FileProgress(file, this.customSettings.progressTarget);
		progress.setStatus("正在上传...");
		progress.toggleCancel(true, this);

                // 首先，为该文件生成一个唯一ID
                // uniqid() 函数在 public/assets/js/uniqid.js 文件中有定义
                var fileUniqKey = uniqid(file.name);

                // 然后构造 action 表单域的值
                // generate_rs_put_path() 在 public/assets/js/helper.js 中有定义
                var action = generate_rs_put_path($bucket, fileUniqKey, file.type);

                // 给隐形表单添加名为 action 的 input 域（字段）
                this.addPostParam("action", action);

                // 给隐形表单添加名为 params 的 input 域（字段）
                // params 里边的数据，用于文件上传成功后，七牛云存储服务器向我们的业务服务器执行 POST 回调
                this.addPostParam("params", "filename="+file.name+"&filekey="+fileUniqKey+"&filetype="+file.type);

                // 给隐形表单添加 名为 auth 的 input 域 （字段）
                this.addPostParam("auth", $upToken);

                // 将该文件唯一ID临时保存起来供后续使用
                this.customSettings.fileUniqIdMapping[file.id] = fileUniqKey;
	}
	catch (ex) {}

	return true;
    }else {
        var progress = new FileProgress(file, this.customSettings.progressTarget);
        progress.setError();
        progress.toggleCancel(false);
        progress.setStatus("PinCode 不能为空" );
        this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
        return false;
    }
}

function uploadProgress(file, bytesLoaded, bytesTotal) {
	try {
		var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);

		var progress = new FileProgress(file, this.customSettings.progressTarget);
		progress.setProgress(percent);
		progress.setStatus("正在上传...");
	} catch (ex) {
		this.debug(ex);
	}
}

/*
 * 定义一个文件上传成功后要处理的业务逻辑
 */
function uploadSuccess(file, serverData) {
	try {
		var progress = new FileProgress(file, this.customSettings.progressTarget);
//		progress.setComplete();  progress.toggleCancel(false);
        //alert(serverData);
		progress.setStatus("已上传，正在推送");


                // 取出之前在 uploadStart() 暂存的文件唯一ID
                var fileUniqKey = this.customSettings.fileUniqIdMapping[file.id];
                var pingCode = $('#pingCode').val();
                var md5_code = $.cookie('md5_code');

                // 组织要回调给网站业务服务器的数据
                var postData = {
                    "file_key": fileUniqKey,
                    "file_name": file.name,
                    "file_size": file.size,
                    "file_type": file.type ,
                    "pinCode": pingCode,
                    "md5_code":md5_code
                };

//                var queryString = "file_key=" +fileUniqKey+"&file_name=" +file.name+"&file_size=" +file.size+"&file_type=" + file.type+"&pinCode=" +pingCode;
                // 通过AJAX异步向网站业务服务器POST数据
                $.ajax({
                    type: "GET",
                    url: '/uploadQiNiu',
                    processData: true,
                    data: postData,
                    beforeSend: function(){},
                    complete: function(){},
                    success:function(resp){
                        if(resp.msg =='ok'){
                            progress.setStatus("发送成功");
                        }else if(resp.msg =='invalid'){
                            progress.setStatus("不是有效的文件");
                        }else{
                            progress.setStatus("发送失败");
                        }
                        progress.setComplete();
                        progress.toggleCancel(false);
//                        document.getElementById(this.customSettings.cancelButtonId).disabled = true;
//                        window.setTimeout(function(){ location.href = "upload";}, 1500);
                    }
                });

                // 预览
                /*
                $.ajax({
                    type: "POST",
                    url: 'op.php',
                    processData: true,
                    data: {"action": "image_preview", "type": 1, "key": fileUniqKey},
                    dataType: "json",
                    beforeSend: function(){},
                    complete: function(){},
                    success:function(resp){
                        if(resp.code == 200) {
                            alert(resp.data.url);
                        }
                    }
                });
                */
	} catch (ex) {
		this.debug(ex);
	}
}

function uploadError(file, errorCode, message) {
	try {
		var progress = new FileProgress(file, this.customSettings.progressTarget);
		progress.setError();
		progress.toggleCancel(false);

		switch (errorCode) {
		case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
			progress.setStatus("上传失败: " + message);
			this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
			progress.setStatus("上传失败.");
			this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.IO_ERROR:
			progress.setStatus("服务器传输错误");
			this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
			progress.setStatus("安全错误");
			this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
			progress.setStatus("超过允许上传的大小.");
			this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
			progress.setStatus("验证失败");
			this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
			// If there aren't any files left (they were all cancelled) disable the cancel button
			if (this.getStats().files_queued === 0) {
				document.getElementById(this.customSettings.cancelButtonId).disabled = true;
			}
			progress.setStatus("已取消");
			progress.setCancelled();
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
			progress.setStatus("已停止");
			break;
		default:
			progress.setStatus("未知错误: " + errorCode);
			this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		}
	} catch (ex) {
        this.debug(ex);
    }
}

function uploadComplete(file) {
	if (this.getStats().files_queued === 0) {

	}
}

// This event comes from the Queue Plugin
function queueComplete(numFilesUploaded) {
	var status = document.getElementById("divStatus");
	status.innerHTML = numFilesUploaded + " 文件已上传";
}
