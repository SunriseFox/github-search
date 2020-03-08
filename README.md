#### Implemented

+ [x] history
+ [x] diff
+ [x] sort

#### Used

+ localStorage for query storage

  + benefit: work multiple tabs, data sync between tabs
  + flaw: maybe data inconsistency with idb

+ idb for query result storage

+ typescript

  + some of critical objects are left un-typed

+ use-subscription

  + data subscription

+ rxjs

  + tried to use... but seems not very useful

+ react useContext / useReducer seems more useful over rxjs / redux

#### TODO:

+ better ui...

+ pagination or infinite scroll

+ keyboard selection

+ well-typed context

+ test