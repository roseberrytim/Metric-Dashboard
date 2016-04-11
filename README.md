# Metric-Dashboard
ExtJs 4.x based dashboard and visual chart layout reporting application designed to integrate with Microsoft SharePoint

You will need to download and install Sencha ExtJs 4.x and use Sencha Cmd to scaffold an application.
Once you have your project created through Sencha Cmd you can integrate the attached files into the project
and build.

This application was originally developed and tested for use within a SharePoint 2007 based hosted environment.
The applicaiton is client-side based and not installed as a feature.  In order to deploy, you will need to use Sencha Cmd to
compile the applicaiton files. You will also need to establish a document library inside a SharePoint site that can be used to 
host the files.  The front-end is deployed through a single webpart page with a content editor webpart configured
to attach to the contained CEWP_Code.txt file.


Main application files are listed under the "app" directory. They are structured in a MVC type pattern that conforms with ExtJs 4.x best practices.
Under "packages" you will find a "sharepoint" custom Sencha Cmd Package that contains the needed data proxy and webservice API's for all
Ext.data.Store's that perform CRUD actions against the SharePoint backend.