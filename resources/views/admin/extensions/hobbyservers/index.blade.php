@extends('layouts.admin')
<?php 
    // Define extension information.
    $EXTENSION_ID = "hobbyservers";
    $EXTENSION_NAME = stripslashes("HobbyServers");
    $EXTENSION_VERSION = "1.0.0";
    $EXTENSION_DESCRIPTION = stripslashes("Hide HobbyServers-managed plugins from the file manager and edit server list MOTD.");
    $EXTENSION_ICON = "/assets/extensions/hobbyservers/icon.jpg";
    $EXTENSION_WEBSITE = "[website]";
    $EXTENSION_WEBICON = "[webicon]";
?>
@include('blueprint.admin.template')

@section('title')
    {{ $EXTENSION_NAME }}
@endsection

@section('content-header')
    @yield('extension.header')
@endsection

@section('content')
    @yield('extension.config')
    @yield('extension.description')@section('extension.description')
@endsection

<div class="hs-admin-page">
    @if(session('success'))
        <div class="alert alert-success alert-dismissible">
            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
            {{ session('success') }}
        </div>
    @endif

    @if($errors->any())
        <div class="alert alert-danger alert-dismissible">
            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
            {{ $errors->first() }}
        </div>
    @endif

    <form action="{{ $root }}" method="POST" id="plans">
        {{ csrf_field() }}
        <input type="hidden" name="hs_plans_save" value="1">

        <div class="box box-primary hs-plans-box">
            <div class="box-header with-border">
                <h3 class="box-title">Server plans</h3>
            </div>
            <div class="box-body">
                @include('admin.extensions.hobbyservers.partials.plans-editor')
            </div>
        </div>
    </form>

    <div class="box box-default">
        <div class="box-header with-border">
            <h3 class="box-title">File manager</h3>
        </div>
        <div class="box-body">
            <ul class="hs-admin-list">
                <li>HobbyServers-managed plugin files (e.g. <code>plugins/HobbyServersRedis.jar</code>, <code>plugins/ServerBridge/</code>) are hidden from the panel file manager.</li>
                <li>The <code>plugins</code> folder cannot be deleted or renamed.</li>
            </ul>
        </div>
    </div>
</div>
@endsection
