import React, { useState, useEffect } from 'react';
import currentStyles from './index.module.scss';
import { Upload, Form } from 'antd';
import type { UploadProps } from 'antd';
import { FileAddOutlined, FolderOpenOutlined, PictureOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import commonController from "../../utils/common/common";
import { uploadFile as uploadFileService } from "../../services/createTask";
import { Tree } from 'antd';
import {useSelector, useDispatch} from "react-redux";
import { updateNewSamples } from '../../stores/sample.store';
let newFileList : any[] = [];
let newFileListInfo : any[] = [];
let newFolder : any = {};
let saveFolderFiles : any[] =[];
const InputInfoConfig = ()=>{
    const { DirectoryTree } = Tree;
    const dispatch = useDispatch();
    let configStep = useSelector(state=>state.existTask.configStep );
    let haveConfigedStep =  useSelector(state=>state.existTask.haveConfigedStep );
    let taskName = useSelector(state=>state.existTask.taskName );
    let taskDescription = useSelector(state=>state.existTask.taskDescription );
    let taskTips = useSelector(state=>state.existTask.taskTips );
    let taskId = useSelector(state=>state.existTask.taskId );
    console.log({
        configStep,
        haveConfigedStep,
        taskName,
        taskDescription,
        taskTips,
        taskId
    })

    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const [haveUploadFiles, setHaveUploadFiles] = useState<any[]>([]);
    const handleChange : UploadProps['onChange'] = (info)=>{
        let newFileList1 = [...info.fileList];
        newFileList = newFileList1;
    }



    const finishUpload = (values : any)=>{
        console.log(values);
    }

    const [flag, setFlag] = useState(true);


    const customRequest = (v:any)=>{
        console.log(v)
    }
    const uploadFileChange = (k:any)=>{
        console.log(k)
    }
    const items = [{
        fileName : 'test1.txt',
        status : 0,
        option : ()=>{
            console.log('delete');
        }
    }];
    const renewUploadFileInFolder = async function(data : any){
        let result = await uploadFileService(1, data.params);
        let temp : any= Object.assign([],haveUploadFiles);
        if (result?.status === 201) {
            commonController.updateElement(saveFolderFiles,0,data.path, false);
        }else{
            commonController.updateElement(saveFolderFiles,0,data.path, true);
        }
        setHaveUploadFiles(saveFolderFiles);
    }
    // uploadFolder
    const deleteFile = (path : string)=>{
        console.log(path);
        console.log(saveFolderFiles);
        commonController.findElement(saveFolderFiles, 0, path);
        console.log(saveFolderFiles);
        setHaveUploadFiles(saveFolderFiles);
        // console.log(parent);

    }
    const isInArray = (children : any, index : number, paths : any)=>{
        return children.some((childItem : any)=> childItem.title === paths[index]);
    };
    const getIndexInArray = (children : any, index : any, paths : any)=>{
        return children.find((childrenItem:any)=>childrenItem.title === paths[index]);
    };
    const confirmFolder = (parent : any , index : any, paths : any, data : any)=>{
        let child = undefined;
        if (parent.children) {
            child = isInArray(parent.children, index, paths);
        }else{
            parent.icon = <img src="/src/icons/folder.png"/>;
            parent.title =  paths[index];
            parent.key = new Date().getTime() + Math.random();
            parent.children =  [];
            parent.path = paths[index];
            child = false;
            confirmFolder(parent, index, paths, data);
            return;
        }
        if(!child){
            if (index === paths.length - 1) {
                parent.children.push({
                    icon : <img src="/src/icons/picture.png" alt=""/>,
                    title : (<div className = {currentStyles.itemInFolder}>
                        <div className = {currentStyles.columnFileName}>{paths[paths.length - 1]}</div>
                        <div className = {currentStyles.columnStatus}>{data.hasUploaded ?
                            (<div className={currentStyles.uploadStatus}><div className={currentStyles.greenCircle}></div>已上传</div>) :
                            (<div className={currentStyles.uploadStatus}><div className={currentStyles.redCircle}></div>上传失败</div>)}</div>
                        <div className = {currentStyles.columnOptionButtons}>
                            {!data.hasUploaded && <div className = {currentStyles.columnOption1}
                            onClick = {()=>renewUploadFileInFolder(data)}> 重新上传 </div>}
                            <div className = {currentStyles.columnOption}
                                 onClick = {commonController.debounce((event : any)=>deleteFile(data.path),1000)}
                                 // onClick = {deleteFile}
                            >删除</div>
                        </div>
                    </div>),

                    key : new Date().getTime() + Math.random(),
                    path : paths[index],
                    isLeaf : true
                })
            }else{
                parent.children.push({
                    icon : <img src= '/src/icons/folder.png' />,
                    title : <span>&nbsp;&nbsp;{paths[index]}</span>,
                    key : new Date().getTime() + Math.random(),
                    path : paths[index],
                    children : []
                })
                confirmFolder(parent.children[parent.children.length - 1], index + 1, paths, data);
            }
            // console.log(newFolder)
        }else{
            if (index !== paths.length - 1) {
                let childIndex = getIndexInArray(parent.children, index, paths);
                if (childIndex || childIndex === 0) {
                    confirmFolder(parent.children[childIndex], index + 1, paths, data);
                }else{
                    console.log('数据有问题')
                }
            }else{
                parent.children.push({
                    icon : <img src= '/src/icons/folder.png' />,
                    title : paths[paths.length - 1],
                    key : new Date().getTime() + Math.random(),
                    isLeaf : true,
                    path : paths[paths.length - 1]
                })
            }
        }
    }
    const setupFolder = ( path : string, fileIndex : number, data : any )=>{
        if (!path) {
            return;
        }else{
            let paths = path.split('/');
            if (fileIndex === 0) {
                newFolder.title = <span>&nbsp;&nbsp;{paths[0]}</span>;
                newFolder.key = new Date().getTime() + Math.random();
                newFolder.children = [];
                newFolder.icon = <img src="/src/icons/folder.png" alt=""/>
                newFolder.path = paths[0];
            }
            confirmFolder(newFolder,  1, paths, data);
        }
    }
    const isCorrectFiles = (files : any)=>{
        let result = true;
        for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
            let file = files[fileIndex].file;
            let isOverSize = commonController.isOverSize(file.size);
            if(isOverSize) {result = false;break;}
            let isCorrectFileType = commonController.isCorrectFileType(file.name);
            if(!isCorrectFileType) {result = false;break;}
        }
        return result;
    }
    const newCustomRequest = async function (info : any){
        console.log(newFileList);
        console.log(info)
        newFileListInfo.push(info);
        console.log(newFileListInfo)
        if (newFileListInfo.length === newFileList.length) {
            let isCorrectCondition = isCorrectFiles(newFileListInfo);
            if(!isCorrectCondition){
                commonController.notificationErrorMessage({message : '请重新选择合适的文件'}, 2);
                newFileList = [];
                newFileListInfo = [];
                return;
            }
            let currentHaveUploadFiles = [];
            console.log(newFileListInfo);
            for (let newFileListInfoIndex = 0; newFileListInfoIndex < newFileListInfo.length; newFileListInfoIndex++) {

                let currentInfo =  newFileListInfo[newFileListInfoIndex];
                console.log(currentInfo);
                console.log(newFileListInfo)
                let path = currentInfo.file.webkitRelativePath ? currentInfo.file.webkitRelativePath : './';
                let result = undefined;
                // if (path.indexOf('/') > -1)
                {
                    // if (newFileListInfoIndex === 0) {
                    //     setHaveUploadFiles(haveUploadFiles.concat([newFolder]));
                    // }
                    // result = await uploadFileService(1, {path, file : currentInfo.file  });
                    // if (result?.status === 201) {
                    //     setupFolder(path, newFileListInfoIndex, {
                    //             size : currentInfo.file.size,
                    //             hasUploaded : true,
                    //             uploadId : result?.data.data.id,
                    //     })
                    //     // });
                    //
                    //     // newFolder.push({name : currentInfo.file.name,
                    //     //     size : currentInfo.file.size,
                    //     //     hasUploaded : true,
                    //     //     uploadId : result?.data.data.id});
                    // }else{
                    //     setupFolder(path, newFileListInfoIndex,{
                    //         size : currentInfo.file.size,
                    //         hasUploaded : false,
                    //         path,
                    //         params : {
                    //             path,
                    //             file : currentInfo.file
                    //         }
                    //         });
                    //
                    //     // newFolder.push({name : currentInfo.file.name,
                    //     //     size : currentInfo.file.size});
                    // }


                // }
                // else{
                //     result = await uploadFileService(1, {path : './', file : currentInfo.file  });
                    result = await uploadFileService(taskId, {path , file : currentInfo.file  });
                    if (result?.status === 201) {
                        currentHaveUploadFiles.push({name : currentInfo.file.name,
                            size : currentInfo.file.size,
                            hasUploaded : true,
                            uploadId : result?.data.data.id,
                            url : result.data.data.url,
                            id : result.data.data.id,
                            params : {
                              path,
                              file : currentInfo.file
                            }
                        });
                    }else{
                        currentHaveUploadFiles.push({name : currentInfo.file.name,
                            size : currentInfo.file.size,
                            params : {
                                path ,
                                file : currentInfo.file
                            }
                        });
                    }
                }
                // console.log(2);
                console.log(result);

                // setHaveUploadFiles(haveUploadFiles.concat(currentHaveUploadFiles))
            }
            console.log(newFolder)
            if (commonController.isNullObject(newFolder)) {
                setHaveUploadFiles(haveUploadFiles.concat(currentHaveUploadFiles))
                saveFolderFiles = saveFolderFiles.concat(currentHaveUploadFiles);
            }else{
                saveFolderFiles.push(newFolder);
                setHaveUploadFiles(haveUploadFiles.concat(currentHaveUploadFiles, [newFolder]))
            }
            newFileList = [];
            newFileListInfo = [];
            newFolder = {};
        }
    }
    const [folderFilePath, setFolderFilePath] = useState(1);
    const handleUploadFolderChange : UploadProps['onChange']  = (info)=>{

        let newFileList1 = [...info.fileList];
        newFileList = newFileList1;

    }

    const deleteUploadFiles = ()=>{
        console.log(1)
    }

    const deleteSingleFile = (itemIndex : number)=>{
        console.log(itemIndex)
       const tempArr = Object.assign([],haveUploadFiles);
       tempArr.splice(itemIndex,1);
       console.log(tempArr)
       setHaveUploadFiles(tempArr);
    }
    const renewUpload = async function(item : any, itemIndex : number){
        console.log(item);
        let result = await uploadFileService(taskId, item.params);
        let temp : any= Object.assign([],haveUploadFiles);
        if (result?.status === 201) {
            temp[itemIndex].hasUploaded = true;
        }else{
            temp[itemIndex].hasUploaded = false;
        }
        setHaveUploadFiles(temp);
    }
    const updateUploadedFiles = ()=>{
        let result = [];
        for (let fileIndex = 0; fileIndex < haveUploadFiles.length; fileIndex++ ) {
            let fileItem = haveUploadFiles[fileIndex];
            if(fileItem.id || fileItem === 0){
                let newItem = {
                    attachement_ids : [fileItem.id],
                    data : {
                        result : {},
                        urls : {[fileItem.id] : fileItem.url},
                        fileNames : {[fileItem.id] : ''}
                    }
                }
                result.push(newItem);
            }
        }
        console.log(result)
        dispatch(updateNewSamples(result))
    }
    useEffect(()=>{
        console.log(haveUploadFiles);
        updateUploadedFiles();
    },[haveUploadFiles]);
    return (<div className = {currentStyles.outerFrame}>
        <div className = {currentStyles.title}>
            <div className={currentStyles.icon}></div>
            <div className = {currentStyles.titleText}>数据导入</div>
        </div>
        <div className = {currentStyles.content}>
            <div className = {currentStyles.left}>
                <div className = {currentStyles.leftTitle}>本地上传</div>
                <div className = {currentStyles.dragAndDrop}>
                    <div className = { currentStyles.survey }></div>
                    <div className = { currentStyles.buttons }>
                        <div className = { currentStyles.uploadFileButton }>
                            <Upload
                                action = {'/api/v1/tasks/1/upload'}
                                // data = {{path : aa}}
                                fileList = {fileList}
                                // maxCount = {1}
                                onChange = { handleChange }
                                multiple =  {true}
                                showUploadList = {false}
                                customRequest={ newCustomRequest }
                            >
                                <FileAddOutlined style={{color : '#FFFFFF'}} />
                                <div style = {{display : 'inline-block', color : '#FFFFFF'}}>上传文件</div>
                            </Upload>
                        </div>
                        <div className = { currentStyles.uploadFolderButton }>
                            {/*<div className = {currentStyles.uploadIcon}></div>*/}

                            <Upload directory
                                // customRequest={customReques

                                    action = {'/api/v1/tasks/1/upload'}
                                    // data = {{path : folderFilePath}}
                                    fileList = {fileList}
                                    // maxCount = {1}
                                    onChange = { handleUploadFolderChange }
                                    multiple =  { true }
                                    showUploadList = { false }
                                    customRequest={ newCustomRequest }
                            >
                                <FolderOpenOutlined style = {{color : '#1b67ff'}}/>
                                <div style = {{display : 'inline-block', color : '#1b67ff'}}>上传文件夹</div>
                            </Upload>
                        </div>
                    </div>
                    <div className= { currentStyles.illustration }>
                        <div className = { currentStyles.supportType }>&nbsp;支持文件类型包括：jpg、png、bmp、gif。
                        </div>
                        <div className = { currentStyles.advises }> 建议单个文件大小不超过200mb </div>
                    </div>
                </div>
            </div>
            <div className={currentStyles.right}>
                <div className={currentStyles.rightTitle}>
                    <div className = {currentStyles.rightTitleLeft}>上传列表</div>
                    <div className = {currentStyles.rightTitleRight}>正在上传&nbsp;
                        <div  className = {currentStyles.rightTitleRightHight}>10</div>
                        /30&nbsp;个文件</div>
                </div>
                <div className={currentStyles.rightContent}>
                    <div className = {currentStyles.columnsName}>
                        <div className = {currentStyles.columnFileName}  style={{color : 'rgba(0, 0, 0, 0.6)'}}>文件名</div>
                        <div className = {currentStyles.columnFileName}  style={{color : 'rgba(0, 0, 0, 0.6)'}}>地址</div>
                        <div className = {currentStyles.columnStatus}  style={{color : 'rgba(0, 0, 0, 0.6)'}}>状态</div>
                        <div className = {currentStyles.columnOption} style={{color : 'rgba(0, 0, 0, 0.6)'}}>操作</div>
                    </div>
                    <div className={currentStyles.columnsContent}>
                        <br/>



                        {haveUploadFiles.map((item : any, itemIndex : number)=>{
                            console.log(item)

                            if (item.children) {
                                return (<div className = {currentStyles.folderItem}>
                                    <DirectoryTree
                                        multiple
                                        selectable={false}
                                        treeData = {[item]}
                                    />
                                </div>)
                            }else{
                                return (<div className = {currentStyles.item}>
                                    <div className = {currentStyles.columnFileName}><img src='/src/icons/picture.png' />&nbsp;&nbsp;{item.name}</div>
                                    <div className = {currentStyles.columnFileName}>{item.params.path}</div>
                                    <div className = {currentStyles.columnStatus}>{item.hasUploaded ?
                                        (<div className={currentStyles.uploadStatus}><div className={currentStyles.greenCircle}></div>已上传</div>) :
                                        (<div className={currentStyles.uploadStatus}><div className={currentStyles.redCircle}></div>上传失败</div>)}</div>
                                    <div className = {currentStyles.columnOptionButtons}>
                                        {!item.hasUploaded && <div className = {currentStyles.columnOption1}
                                        onClick = {()=>renewUpload(item, itemIndex)}> 重新上传 </div>}
                                        <div className = {currentStyles.columnOption}
                                             onClick = { ()=>deleteSingleFile(itemIndex) }
                                        >删除</div>
                                    </div>

                                </div>)
                            }

                        })}
                    </div>
                </div>
            </div>
        </div>
    </div>)
}
export  default InputInfoConfig;

