export async function printf(msg) {
    console.log(msg)
    const res = await new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve(1112222)
        })
    })
    console.log(res)

}