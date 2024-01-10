import React from 'react'
import cedClasses from './darkMode.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

function darkMode(props) {
    const classes = mergeClasses(cedClasses, props.classes);
const body = document.querySelector('body');
function toggleDark() {
  if (body.classList.contains('dark')) {
    body.classList.remove('dark');
    localStorage.setItem("theme", "light");
  } else {
    body.classList.add('dark');
    localStorage.setItem("theme", "dark");
  }
}
if (localStorage.getItem("theme") === "dark"){
body.classList.add('dark');
}

  return (<>
    <div>
      <div className={classes.wishlist_icon_wrap}>
      <div>
      <button id='theme-btnMode' onClick={toggleDark} className={classes.themeMode_btn}>
      <FontAwesomeIcon
                                icon={faSun}
                            />
      <FontAwesomeIcon
                                icon={faMoon}
                            />
    <div className={classes.ball} ></div>
  </button>
</div>
     </div>
    </div>
    </>
  )
}

export default darkMode



