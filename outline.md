A. Introduction to Speaker
B. MongoDB - Joys and Challenges of Document Oriented Databases
    1. History and Status of MongoDB
        a. Started by 10Gen as a PaaS
        b. Open-source with professional support by 10gen
        c. Current Version is 2.4.5
        d. Aggregation framework available since version 2.1
    2. Relational vs. Document-Oriented Database
        a. Fully normalized DB (schema diagram)
            aa. Accurate, concise
            aa. Maps poorly to application objects  (bring in object schema)
            bb. Difficult to update and query.
        b. Denormalized schema (simplified schema diagram)
            aa. Even less compatible with application data.
        c. Key-Value store. (black box collections)
            aa. DB Understands abstracted view of data.
            bb. Application manages detailed view.
            cc. partial updates and advanced queries not possible
        d. NoSQL (MongoDB)
            aa. Still primarily a key-value store
            bb. DB understands structure of documents enough to perform update and querying operations.
    3. Simple MongoDB examples.
        a. insert
        b. find
        c. $set update
        d. query with projection
C. MongoDB Aggregation Framework
    1. Reporting
        a. Everything that isn't CRUD
            aa. Analysis, Data Mining
            bb. Offline
            cc. In DODB, typically requires running entire database through application.
        b. Map-Reduce
            aa. Flexible, Parallizable
            bb. Slow (full collection, spidermonkey)
        c. Aggregation Framework
            aa. Fast (uses indexes, written in C, still parallelizable)
            bb. Less Flexible but still powerful
    2. Stages
        a. Conceptually each stage transforms one collection into another.
        b. Each stage transforms a complex collection into a simpler one
        c. "Simple" is complicated in DODB. Simple can mean
            aa. Fewer documents
            bb. Less data or more procesed in each document
            cc. Less structure in the document.
        d. One rule always be simplifying
    3. Syntax
        a. JS array of object literals.
        b. Each object contains exactly one command (caveats.)
    4. Commands
        a. $match
            aa. Reduces collection complexity by removing documents that don't match the criteria.
            bb. Corresponds to filter() or where clause
            cc. Uses indexes - Important to put first
            dd. Supports most of the commands found in MongoDB query syntax.
        b. $project
            aa. Reduces document complexity by removing unnecessary fields.
            bb. Reduces complexity of each document by performing simple calculations between fields within same document.
            cc. Corresponds to map() or select clause (between the SELECT and FROM) in SQL
            dd. Very similar to the second parameter in a MongoDB query and supports most of the syntax.
        c. $unwind
            aa. Reduces document complexity at the expense of collection complexity by flattening an array within the document into multiple documents, each containing one element from the array.
            bb. Corresponds roughtly to flatten(), similar to an outer join.
            cc. Does not necessarily clone document data.
        d. $group
            aa. Reduces collection complexity (possibly at expense of document complexity) by aggregating fields of multiple documents into the fields one or more documents.
            bb. Corresponds to reduce()
            cc. similar to GROUP BY expression + aggregate functions in SQL.
            dd. Documents are reduced by specifying an _id that is the same for all documents in a group.
            ee. _ids can be a single field or a projection specification (very powerful)
            ff. Use constant for _id to reduce into single document.
            gg. Remaining fields in document must be aggregation functions: $addToSet, $first, $last, $max, $min, $avg, $push, $sum
            hh. Aggregation functions have some unintuitive uses (e.g. $sum:1 counts documents)
            ii. More complicated calculations can be performed with $push and then further stages.
        e. $sort
            aa. Sorts on the values of one or more fields.
            bb. Use a project stage prior to sorting to sort on a calculation.
        f. $skip, $limit
            aa. Range operators on results.
            bb. Can be powerful when combined with $sort and used in the middle of a pipeline.
D. Advanced Examples





