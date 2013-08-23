Slide: Motivation - Why do we need an aggregation framework? Why do we need MongoDB in the first place, or for that matter why do we need new databases at all?

Slide: SQL / Relational model - 1970s, successful, standardized up through the 1990's

Slide: picture of office workers using computers labeld "SQL" - SQL would be written by people

Slide: picture of server rack - Primary SQL user, writing millions, billions or trillions of SQL statements. Don't know and don't care the grammar mimics English. Doesn't know what the statements mean. They just plug in the values they are given.

Slide: picture Little Johnny Droptables cartoon - Sometimes this causes problems.

That's the NoSql debate, but we're really concerned with the relational model.

Slide: Fully normalized relational schema diagram - Relational model takes relatively flat data structures called tables and builds more complicated structure through relationships (equivalent values in different tables). Fully normalized schemas reduce redundancy and dependency. Explain diagram.

Slide: same picture of office workers with exclamation bubbles. Fully normalized schemas are hard to use. They're difficult to update because a single event might require updating many rows in various places in the database. Difficult to query becaus a single result could require multiple joins.

Slide: fully normalized schema next to object schema with mismatch symbol. Objects in the application do have structure. ORMs can link these up, but configuring the ORM can be a complex task.

Slide: denomalized schema next to application: We can denormalize the schema to better match our data model, but we can't get around the fact that data is still structured in fundamentally different ways. When you hear tales of web-pages that trigger 1000s of requests, this mismatch combined with some mild incompetence is usually to blame.

Slide: schema components are covered by boxes: key value stores. Storing and querying data is easy. With good indices, querying is easy and fast. Application manages the serialization and deserialization of the data in the way it finds most convenient. Perfect solution, until it isn't. No atomic or incremental updates. No queries without an index. No way to process the data without loading an entire collection into memory. We need a database that acts like a key-value store most of the time, but can reach inside and manipulate it when it needs to.

Slide: JSON - The Lowest Common Denominator
Slide BSON - The Lowest Commoner Denominator

Slide: same as above only application structure is visible under the boxes. labeled MongoDB (Document Oriented Database). Mongo strikes a balance by maintaining some understanding of the data structure.

Slide: example find query
Slide: example incremental update

Slide: Data processing queries (reporting) - What about reporting. Still key value store at heart. Once it has a set of documents, it can peek inside to further filter them out, or it can update them in place, but these actions are still only acting on individual documents.

Slide: map reduce example. label: Map Reduce - Prior to 2.1 the answer has been Map/Reduce (the magic formula that makes everything scale). Same answer as CouchDB and Riak. You figure out the logic, Mongo will make it scale. Sub-slide "slow". Except the fact that it would run in pararrel on 1000 computers didn't make up for how slow it ran on just one. SpiderMonkey backend was slow and serialiation into and out of JS takes a long time. Main problem is that you would always have to pour the entire collection into it.

Slide: The Aggregation Framework (finally). The aggregation framework makes MongoDB work.

Slide: Aggregate queries:
    Array of stages
    Object literal syntax
    Operate on a single collection.

Slide: example query - I'll explain this later.

Slide: Conceptually, each stage transforms a collection of documents into another collection of documents.

Slide: Collection complexity vs. Document complexity - two axis graph, Multiple lines drawn, each segment represents a stage.

Slide: Best rule for aggregate queries. Always be simplifying.

Slide: The players:
    $match
    $project
    $sort
    $limit
    $skip
    $unwind
    $group

Into interactive examples

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





