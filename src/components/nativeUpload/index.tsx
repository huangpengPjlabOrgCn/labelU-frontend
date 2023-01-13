import React, { HTMLAttributes, PropsWithChildren, createRef, useEffect, useState } from 'react';
import { UploadFileStatus, UploadFile, RcFile } from 'antd/lib/upload/interface';
import styles from './index.module.scss';

type IProps = HTMLAttributes<HTMLDivElement> & {
    accept?: string;
    directory?: boolean; // 是否开启文件夹上传
    multiple?: boolean; // 多文件上传
    onChange?: (files: RcFile[]) => void;
}

const NativeUpload: React.FC<PropsWithChildren<IProps>> = (props) => {
    const inputRef = createRef<any>();
    const {
        children, style, className, directory, multiple, ...req
    } = props;
    // const d = directory ? { webkitdirectory: 'true' } : {};
    // const [d, setD] = useState<any>( {  } );
    useEffect(()=>{
        // directory ? inputRef.current.webkitdirectory = true : {}
        inputRef.current.webkitdirectory = directory;
        inputRef.current.multiple = multiple;
    },[])
    return (
        <div className={styles.upload}>
            <input
                ref = {inputRef}
                type="file"
                name="fileList"
                {...req}
                onChange={(e) => {
                    props.onChange?.(Array.from(e.target.files || []) as RcFile[]);
                    e.target.value = '';
                }}
            />
            {children}
        </div>
    );
};

export default NativeUpload;
