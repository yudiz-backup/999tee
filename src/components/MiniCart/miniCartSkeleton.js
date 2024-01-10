import React from 'react'
import ContentLoader from 'react-content-loader';

function miniCartSkeleton() {
  return (
    <>
   <div style={{padding: '10px 15px', pointerEvents: 'none'}}>
   <div>
    <ContentLoader title='hello' height={30}>
    <rect x="0" y="0" width="100%" height="20" />

    </ContentLoader>
   <ContentLoader title='' height={90} >
    <rect x="0" y="0" width="70" height="90" />
    <rect x="80" y="6"  width="160" height="16" />
    <rect x="350" y="6"  width="20" height="16" />
    <rect x="380" y="6"  width="20" height="16" />
    <rect x="80" y="30"  width="100" height="10" />
    <rect x="80" y="50"  width="50" height="10" />
    <rect x='330' y="40"  width="120" height="20" />
    <rect x="80" y="70"  width="70" height="10" />
  </ContentLoader>
   </div>
   <div className='my-2'>
   <ContentLoader title='' height={90} >
    <rect x="0" y="0" width="70" height="90" />
    <rect x="80" y="6"  width="160" height="16" />
    <rect x="350" y="6"  width="20" height="16" />
    <rect x="380" y="6"  width="20" height="16" />
    <rect x="80" y="30"  width="100" height="10" />
    <rect x="80" y="50"  width="50" height="10" />
    <rect x='330' y="40"  width="120" height="20" />
    <rect x="80" y="70"  width="70" height="10" />
  </ContentLoader>
   </div>
   <div>
   <ContentLoader height={90} >
    <rect x="0" y="0" width="70" height="90" />
    <rect x="80" y="6"  width="160" height="16" />
    <rect x="350" y="6"  width="20" height="16" />
    <rect x="380" y="6"  width="20" height="16" />
    <rect x="80" y="30"  width="100" height="10" />
    <rect x="80" y="50"  width="50" height="10" />
    <rect x='330' y="40"  width="120" height="20" />
    <rect x="80" y="70"  width="70" height="10" />
  </ContentLoader>
  <ContentLoader height={200}>
    <rect x="0" y="60" width="48%" height="400" />
    <rect x="210" y="60" width="48%" height="400" />
    </ContentLoader>
    <ContentLoader height={150}>
    <rect x="0" y="100" width="100%" height="60" />

    </ContentLoader>
   </div>
   </div>
    </>
  )
}

export default miniCartSkeleton
