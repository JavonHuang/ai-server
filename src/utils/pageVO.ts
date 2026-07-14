export class PageVO<T>{
  data:T|null=null
  currentPage:number=0
  pageSize:number=0
  total:number=0
  constructor(data:T,currentPage:number,pageSize:number){
    this.data=data
    this.currentPage=currentPage
    this.pageSize=pageSize
  }

  get offset(){
    return this.currentPage*this.pageSize
  }

  get startIndex(){
    return (this.currentPage-1<0?0:this.currentPage-1)*this.pageSize
  }

  public result=() =>Promise.resolve(this)
}