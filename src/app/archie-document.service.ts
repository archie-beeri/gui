import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";

import { ArchieDoc } from "./model/archie-doc";
import { ImportAttributes } from "./model/import-attributes";

const httpOptions = {
  headers: new HttpHeaders({ "Content-Type": "application/json" })
};

@Injectable({
  providedIn: "root"
})
export class ArchieDocumentService {

  private docsUrl: string;
  private exportUrl: string;
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.docsUrl = window.location.origin + "/docs?wt=json&indent=on";
    this.exportUrl = window.location.origin + "/docs?wt=csv";
    this.apiUrl = window.location.origin + "/api/rest";
  }

  getDcTypes(): Observable<any> {
    let url = this.docsUrl + "&q=*:*&fl=id&facet=on&facet.field=dcType";
    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError("getSummary", [])));
  }

  getDcCreators(): Observable<any> {
    let url =
      this.docsUrl +
      "&q=*:*&fl=id&facet=on&facet.field=dcCreator&facet.sort=index&facet.limit=1000000";
    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError("getCreators", [])));
  }

  getAllCollections(): Observable<any> {
    let url =
      this.docsUrl +
      "&q=dcType:collection&fl=dcTitleString&sort=dcTitleString asc&rows=1000";
    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError("getAllCollections", [])));
  }

  getImportFolders(): Observable<any> {
    let url = this.apiUrl + "/docs/folders";
    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError("getImportFolders", [])));
  }

  getImportFoldersReport(): Observable<any> {
    let url = this.apiUrl + "/reports/import-folders";
    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError("getImportFoldersReport", [])));
  }

  getImportFilesReport(folderId: string): Observable<any> {
    let url = this.apiUrl + "/reports/import-folder/" + folderId;
    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError("getImportFoldersReport", [])));
  }

  getSearchResults(
    searchParams: string,
    start: number,
    rows: number
  ): Observable<any> {
    let url =
      this.docsUrl +
      "&q.op=AND&" +
      searchParams +
      "&fl=id,dcTitle,dcDate,dcCreator,dcDescription,dcSubject,storageLocation,dcFormat,dcType,dcIsPartOf,dcAccessRights,importTime" +
      "&start=" +
      start +
      "&rows=" +
      rows;
    console.log(url);
    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError("getSearchResults", [])));
  }

  getSearchResultsAsCsv(searchParams: string, totalDocumentsFound: number): Observable<any> {
    let url =
      this.exportUrl +
      "&q.op=AND&" +
      searchParams +
      "&rows=" + totalDocumentsFound +
      "&fl=id,dcTitle,dcDate,dcCreator,dcDescription,dcSubject,storageLocation,dcFormat,dcType,dcIsPartOf,dcAccessRights";
    return this.http.get(url, {
      //headers: new HttpHeaders({ "Content-Type": "text/plain" })
      responseType: "text"
    }).pipe(catchError(this.handleError("getSearchResultsAsCsv", [])));
  }

  updateDocument(doc: ArchieDoc): Observable<any> {
    let url = this.apiUrl + "/docs";
    let docs: ArchieDoc[] = [doc];
    //console.log(url);
    console.log("updating doc " + JSON.stringify(docs));
    return this.http
      .put(url, docs, httpOptions)
      .pipe(catchError(this.handleError("updateDocument", [])));
  }

  importFolder(importAttributes: ImportAttributes): Observable<any> {
    let url = this.apiUrl + "/docs/folder";
    return this.http
      .post(url, importAttributes, httpOptions)
      .pipe(catchError(this.handleError("importFolder", [])));
  }

  deleteDocument(id: string): Observable<any> {
    let url = this.apiUrl + "/docs/delete/" + id;
    return this.http
      .delete(url, httpOptions)
      .pipe(catchError(this.handleError("deleteDocument", [])));
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      return of(result as T);
    };
  }
}
