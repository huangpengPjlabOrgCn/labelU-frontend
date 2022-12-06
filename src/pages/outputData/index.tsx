import React, {useState, useEffect} from 'react';
import currentStyles from './index.module.scss'
import {Modal} from "antd";
const OutputData = (props : any)=>{
    // let isShowModal = props.isShowModal;
    let isShowModal = true;
    const [activeTxt, setActiveTxt] = useState('JSON');
    const highLight = (value : string)=>{
        setActiveTxt(value);
    }
    return (<Modal title = '选择导出格式'
                   okText={'导出'}
    open = {isShowModal}>
        <div className={currentStyles.outerFrame}>
            <div className = {currentStyles.pattern}>
                <div className = {currentStyles.title}>导出格式</div>
                <div className = {currentStyles.buttons}>
                    {activeTxt === 'JSON' && <div className = {currentStyles.buttonActive} onClick = {()=>highLight('JSON')}>JSON</div>}
                    {activeTxt !== 'JSON' && <div className = {currentStyles.button} onClick = {()=>highLight('JSON')}>JSON</div>}

                    {activeTxt === 'COCO' && <div className = {currentStyles.buttonActive} onClick = {()=>highLight('COCO')}>COCO</div>}
                    {activeTxt !== 'COCO' && <div className = {currentStyles.button} onClick = {()=>highLight('COCO')}>COCO</div>}

                    {activeTxt === 'MASK' && <div className = {currentStyles.buttonActive} onClick = {()=>highLight('MASK')}>MASK</div>}
                    {activeTxt !== 'MASK' && <div className = {currentStyles.button} onClick = {()=>highLight('MASK')}>MASK</div>}
                </div>
            </div>
            <div className={currentStyles.bottom}>Label U 标准格式，包含任务id,标注结果、url、fileName字段</div>
        </div>
    </Modal>)
}
export default OutputData;