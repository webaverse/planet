import React, {useState, useEffect, useRef} from 'react';
import classnames from 'classnames';
import styles from './Footer.module.css';

export default () => {
  return (
    <footer>
      <div className={classnames(styles.helper, styles.left)}>
        <div className={styles.loadout}>
          {(() => {
            const numItems = 8;
            const items = Array(numItems);
            for (let i = 0; i < numItems; i++) {
              items[i] = (
                <div className={styles.item} key={i}>
                  <div className={styles.box}></div>
                  <div className={styles.label}>{i+1}</div>
                </div>
              );
            }
            return items;
          })()}
        </div>
      </div>
      <div className={classnames(styles.helper, styles.right)}>
        {/* <div className={styles.chat} id="chat">
          <div className={styles.messages} id="chat-messages"></div>
          <input type="text" className={styles.input} />
        </div> */}
        <div className={styles.keys}>
          <div className={styles.label}>Move</div>
          <div className={styles.row}>
            <div className={styles.key}></div>
            <div className={styles.key}>W</div>
            <div className={styles.key}></div>
          </div>
          <div className={styles.row}>
            <div className={styles.key}>A</div>
            <div className={styles.key}>S</div>
            <div className={styles.key}>D</div>
          </div>
        </div>
        <div className={styles.keys}>
          <div className={styles.row}></div>
          <div className={styles.row}>
            <div className={classnames(styles.label, styles.center)}>Fly</div>
            <div className={styles.key}>F</div>
          </div>
        </div>
        <div className={styles.keys}>
          <div className={styles.row}></div>
          <div className={styles.row}>
            <div className={classnames(styles.label, styles.center)}>Camera</div>
            <div className={styles.key}><i className="far fa-mouse-alt"></i></div>
          </div>
        </div>
        <div className={styles.keys}>
          <div className={styles.row}></div>
          <div className={styles.row}>
            <div className={classnames(styles.label, styles.center)}>Talk</div>
            <div className={styles.key}>T</div>
          </div>
        </div>
        <div className={styles.keys}>
          <div className={styles.row}></div>
          <div className={styles.row}>
            <div className={classnames(styles.label, styles.center)}>Upload</div>
            <div className={styles.key}>U</div>
          </div>
        </div>
        <div className={styles.keys}>
          <div className={styles.row}></div>
          <div className={styles.row}>
            <div className={classnames(styles.label, styles.center)}>Text chat</div>
            <div className={styles.key}>Enter</div>
          </div>
        </div>
      </div>
    </footer>
  );
};